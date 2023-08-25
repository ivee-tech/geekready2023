using Microsoft.AspNetCore.Mvc;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using static PubSub.Common.Configuration.ConfigurationExtensions;
using PubSub.Common.Models;
using PubSub.Common.Configuration;
using PubSub.Common.Exceptions;
using PubSub.Common.Interfaces;
using PubSub.Common.Services;
using PubSub.Web.Api.Configuration;

namespace PubSub.Web.Api.Services
{
    public class CommandMessageService : ICommandMessageService
    {

        private readonly bool _isProduction;

        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ApiClient _apiClient;
        private readonly ILogger<CommandMessageService> _logger;

        public CommandMessageService(IWebHostEnvironment environment, IConfiguration configuration, ApiClient apiClient, ILogger<CommandMessageService> logger)
        {
            _environment = environment;
            _configuration = configuration;
            _apiClient = apiClient;
            _isProduction = _environment.IsProduction();
            _logger = logger;
        }

        public async Task<MsgResponse> PublishCommandMessage(MsgRequest request)
        {

            var daprPubSubUrl = _configuration.GetValue("Settings:DaprPubSubUrl", "DAPR_PUBSUB_URL");
            try
            {
                if(!request.Data.Id.HasValue)
                {
                    request.Data.Id = Guid.NewGuid();
                }
                var sArgs = request.Data.Arguments;
                if (request.Data.Arguments.EndsWith("> scan-results.sarif") || request.Data.Arguments.EndsWith("> results.sarif"))
                {
                    sArgs = sArgs.Replace("> scan-results.sarif", "").Replace("> results.sarif", "");
                }
                var args = sArgs.Split(' ', StringSplitOptions.TrimEntries).ToList();
                _logger.LogInformation("sArgs: {0}", sArgs);
                _logger.LogInformation("args[0]: {0}", args[0]);
                switch (args[0])
                {
                    case "trivy":
                        PrepTrivy(args, request.Data);
                        break;
                    case "sonar-scanner":
                        PrepSonarScanner(args, request.Data);
                        break;
                    case "zap-cli":
                    case "zap.sh":
                        PrepOwaspZapScanner(args, request.Data);
                        break;
                    default:
                        break;
                }
                await _apiClient.PostAsync<MsgRequest>(daprPubSubUrl, request, Constants.Command);
                var msg = $"Message published successfully. Message data: {request.Data}";
                _logger.LogInformation(msg);
                var response = new MsgResponse() { Message = msg };
                return response;
            }
            catch (ApiException ex)
            {
                var error = ex.ToString();
                _logger.LogError(error);
                switch (ex.Type)
                {
                    case Constants.Command:
                        var errMsg = $"ERROR: Failed publishing command message. Error: {error}";
                        var response = new MsgResponse { Message = errMsg };
                        return response;
                    default:
                        break;
                }
                throw new Exception(error);
            }
            catch (Exception ex)
            {
                var error = ex.ToString();
                _logger.LogError(error);
                throw new Exception(error);
            }
        }

        private void PrepTrivy(List<string> args, CommandMessage cmdMsg)
        {
            if(args.Count < 2)
            {
                return;
            }
            var d = DateTime.UtcNow.ToString("yyyyMMdd_HHmmssZ");
            cmdMsg.Tool = args[0];
            cmdMsg.Command = args[1];
            cmdMsg.Name = $"Scan {d}";
            cmdMsg.Description = $"Scan {cmdMsg.Command} vulnerabilities using {cmdMsg.Tool}.";
            cmdMsg.Target = "ADO";
            cmdMsg.Version = "0.41.0";
            args.RemoveAt(0);
            args.RemoveAt(0);
            var fullName = args.LastOrDefault();
            if (!string.IsNullOrEmpty(fullName))
            {
                args.Remove(fullName);
                args.Insert(0, fullName);
                var name = fullName.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
                var identifierName = name.Replace(":", "_").Replace(".", "_");
                cmdMsg.OutputPath = $"{identifierName}-{d}";
                cmdMsg.OutputFileName = $"{identifierName}.sarif";
                cmdMsg.Arguments = String.Join(" ", args) + $" --format sarif --output ./results/{cmdMsg.OutputFileName}";
            }
        }

        private void PrepSonarScanner(List<string> args, CommandMessage cmdMsg)
        {
            if (args.Count < 2)
            {
                return;
            }
            var d = DateTime.UtcNow.ToString("yyyyMMdd_HHmmssZ");
            var tool = "sonar-scanner-other";
            var projectKey = "gr-test-001";
            var hostUrl = "http://20.53.168.136/";
            var srcPath = $"/c/s/{projectKey}";
            var targetPath = "/app/src/";
            var version = "4.8";
            cmdMsg.Tool = tool;
            cmdMsg.Command = args[1];
            cmdMsg.Name = $"Scan {d}";
            cmdMsg.Description = $"Scan repository vulnerabilities using {cmdMsg.Tool}.";
            cmdMsg.Target = "ADO";
            cmdMsg.Version = version;
            args.RemoveAt(0);
            args.RemoveAt(0);
            var argsDict = new Dictionary<string, string>();
            argsDict.Add("Type", tool);
            argsDict.Add("ProjectKey", projectKey);
            argsDict.Add("HostUrl", hostUrl);
            argsDict.Add("Version", version);
            var repoUrl = args.LastOrDefault();
            _logger.LogInformation("fullName: {0}", repoUrl);
            if (!string.IsNullOrEmpty(repoUrl))
            {
                args.Remove(repoUrl);
                args.Insert(0, repoUrl);
                var repoName = repoUrl.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
                var identifierName = repoName.Replace(":", "_").Replace(".", "_");
                cmdMsg.OutputPath = $"{identifierName}-{d}";
                cmdMsg.OutputFileName = $"{identifierName}";
                cmdMsg.Arguments = String.Join(" ", args);
                argsDict.Add("RepoName", repoName);
                argsDict.Add("RepoUrl", repoUrl);
            }
            cmdMsg.ArgumentsDict = argsDict;
        }

        private void PrepOwaspZapScanner(List<string> args, CommandMessage cmdMsg)
        {
            if (args.Count < 2)
            {
                return;
            }
            var d = DateTime.UtcNow.ToString("yyyyMMdd_HHmmssZ");
            var tool = "owasp-zap";
            var version = "0.0.1";
            var port = 443;
            var outputDir = "/";
            cmdMsg.Tool = tool;
            cmdMsg.Command = args[1];
            cmdMsg.Name = $"Scan {d}";
            cmdMsg.Description = $"Scan repository vulnerabilities using {cmdMsg.Tool}.";
            cmdMsg.Target = "ADO";
            cmdMsg.Version = version;
            args.RemoveAt(0);
            args.RemoveAt(0);
            var argsDict = new Dictionary<string, string>();
            argsDict.Add("Port", port.ToString());
            argsDict.Add("OutputDir", outputDir);
            argsDict.Add("Version", version);
            var url = args.LastOrDefault();
            _logger.LogInformation("url: {0}", url);
            if (!string.IsNullOrEmpty(url))
            {
                var name = url.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
                var identifierName = name.Replace(":", "_").Replace(".", "_");
                cmdMsg.OutputPath = $"{identifierName}-{d}";
                cmdMsg.OutputFileName = $"{identifierName}";
                cmdMsg.Arguments = String.Join(" ", args);
                argsDict.Add("Url", url);
            }
            cmdMsg.ArgumentsDict = argsDict;
        }

    }
}

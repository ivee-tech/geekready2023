using Microsoft.AspNetCore.Mvc;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using PubSub.Common.Configuration;
using PubSub.Common.Interfaces;
using PubSub.Common.Models;
using Dapr;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PubSub.Web.Api.Controllers
{
    [Route("api/cmd-msg")]
    [ApiController]
    public class CommandMessageController : ControllerBase
    {

        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private readonly ICommandMessageService _cmdMsgService;

        public CommandMessageController(IWebHostEnvironment env, IConfiguration configuration, ICommandMessageService cmdMsgService)
        {
            _env = env;
            _configuration = configuration;
            _cmdMsgService = cmdMsgService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetCommandMessage()
        {
            var response = new MsgResponse()
            {
                Message = "Test data"
            };
            return Ok(response);
        }

        [HttpPost("")]
        [Topic("pubsub", "cmd-msg")]
        public async Task<IActionResult> SendCommandMessage(MsgRequest request)
        {
            //if (string.IsNullOrEmpty(request?.Data?.Name))
            //{
            //    return BadRequest("Name cannot be empty.");
            //}
            try
            {
                var response = await _cmdMsgService.PublishCommandMessage(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Problem(ex.ToString());
            }
        }

    }
}

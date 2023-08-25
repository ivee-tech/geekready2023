using PubSub.Common.Models;
using Polly.Extensions.Http;
using Polly;
using PubSub.Common.Exceptions;
using PubSub.Common.Interfaces;
using PubSub.Web.Api.Services;
using PubSub.Common.Services;
using Microsoft.VisualBasic;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<ApiClient>();
builder.Services.AddScoped<ICommandMessageService, CommandMessageService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(x => x.AllowAnyHeader()
      .AllowAnyMethod()
      .AllowAnyOrigin());

app.UseAuthorization();

app.MapControllers();

app.Run();


static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        //.OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound 
        //    || msg.StatusCode == System.Net.HttpStatusCode.BadRequest
        //    || msg.StatusCode == System.Net.HttpStatusCode.InternalServerError)
        .Or<HttpRequestException>()
        .WaitAndRetryAsync(6, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
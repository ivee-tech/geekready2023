ARG USE_ENV_VAR

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

WORKDIR /src
COPY ["PubSub.Web.Api/PubSub.Web.Api.csproj", "PubSub.Web.Api/"]
COPY ["PubSub.Common/PubSub.Common.csproj", "PubSub.Common/"]
RUN dotnet restore "PubSub.Web.Api/PubSub.Web.Api.csproj"
COPY . .
WORKDIR "/src/PubSub.Web.Api"
RUN dotnet build "PubSub.Web.Api.csproj" -c Release -o /app/build

FROM build AS publish
ARG USE_ENV_VAR
ENV USE_ENV_VAR=${USE_ENV_VAR}
RUN dotnet publish "PubSub.Web.Api.csproj" -c Release -o /app/publish
RUN apt-get update
RUN apt-get install -y jq
# RUN echo $(sed s/__Settings--UseEnvVar__/${USE_ENV_VAR}/g /app/publish/appsettings.json) > /app/publish/appsettings.json
RUN echo $(jq --arg uev "${USE_ENV_VAR}" '.Settings.UseEnvVar = $uev' /app/publish/appsettings.json) > /app/publish/appsettings.json

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PubSub.Web.Api.dll"]

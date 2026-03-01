FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS development
WORKDIR /app
COPY . .
RUN dotnet restore ShockStack.slnx

FROM development AS build
RUN dotnet publish src/ShockStack.Api -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS production
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ShockStack.Api.dll"]

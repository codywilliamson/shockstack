FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS development
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY . .
RUN dotnet restore ShockStack.slnx

FROM development AS build
RUN dotnet publish src/ShockStack.Api -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /out .
RUN addgroup --gid 1001 --system appgroup && adduser --uid 1001 --system --ingroup appgroup appuser && chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -fsS http://127.0.0.1:8080/api/v1/health/ready || exit 1
ENTRYPOINT ["dotnet", "ShockStack.Api.dll"]

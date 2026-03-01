var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var db = postgres.AddDatabase("shockstack");

var api = builder.AddProject<Projects.ShockStack_Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.AddViteApp("frontend", "../../frontend")
    .WithPnpm()
    .WithHttpEndpoint(port: 4321, env: "PORT")
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();

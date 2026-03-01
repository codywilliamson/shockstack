var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var db = postgres.AddDatabase("shockstack");

var api = builder.AddProject<Projects.ShockStack_Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.AddViteApp("frontend", "../../../frontend")
    .WithPnpm(install: false)
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();

using Warzinho.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true);
    });
});

builder.Services.AddSignalR();
builder.Services.AddSingleton<RoomStore>();

var app = builder.Build();

app.UseCors("Frontend");

app.MapGet("/health", () => Results.Ok(new
{
    service = "warzinho-server",
    status = "ok",
    utc = DateTimeOffset.UtcNow
}));

app.MapHub<GameHub>("/hubs/game");

app.Run();

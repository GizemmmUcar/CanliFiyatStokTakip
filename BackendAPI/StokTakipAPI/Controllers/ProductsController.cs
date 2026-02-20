using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StokTakipAPI.Data;
using StokTakipAPI.Hubs;
using StokTakipAPI.Models;
using System.Net.Http;
using System.Text.Json;

namespace StokTakipAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IHubContext<ProductHub> _hubContext;
        private readonly AppDbContext _context;

        public ProductsController(IHubContext<ProductHub> hubContext, AppDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var products = await _context.Urunler.ToListAsync();
            return Ok(products);
        }

        [HttpGet("currency")]
        public async Task<IActionResult> GetCurrency()
        {
            try
            {
                using var client = new HttpClient();
                var response = await client.GetAsync("https://api.exchangerate-api.com/v4/latest/USD");
                response.EnsureSuccessStatusCode();

                var jsonString = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonString);
                var tryRate = document.RootElement.GetProperty("rates").GetProperty("TRY").GetDecimal();

                return Ok(new { rate = tryRate });
            }
            catch (Exception)
            {
                return Ok(new { rate = 3 });
            }
        }

        [HttpGet("change-prices")]
        public async Task<IActionResult> ChangePrices()
        {
            var random = new Random();
            var products = await _context.Urunler.ToListAsync();

            foreach (var urun in products)
            {
                urun.FiyatUsd += random.Next(-50, 50);

                if (urun.Stok > 0)
                    urun.Stok -= random.Next(0, 2);
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("Currency Updated", products);

            return Ok("Fiyatlar SQL Veritabanına kaydedildi.");
        }
    }
}
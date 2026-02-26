using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StokTakipAPI.Data;
using StokTakipAPI.Hubs;
using StokTakipAPI.Models;
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

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Urun yeniUrun)
        {
            if (yeniUrun == null)
                return BadRequest("Ürün bilgileri boş olamaz.");

            if (yeniUrun.SatisGecmisi == null || yeniUrun.SatisGecmisi.Length == 0)
            {
                yeniUrun.SatisGecmisi = new int[] { 0, 0, 0, 0, 0, 0, 0 };
            }

            _context.Urunler.Add(yeniUrun);
            await _context.SaveChangesAsync();

            var products = await _context.Urunler.ToListAsync();
            await _hubContext.Clients.All.SendAsync("Currency Updated", products);

            return Ok(yeniUrun);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Urun guncelUrun)
        {
            var urun = await _context.Urunler.FindAsync(id);
            if (urun == null)
                return NotFound($"ID'si {id} olan ürün bulunamadı.");

            urun.UrunAdi = guncelUrun.UrunAdi;
            urun.Stok = guncelUrun.Stok;
            urun.FiyatUsd = guncelUrun.FiyatUsd;
            urun.SatisGecmisi = guncelUrun.SatisGecmisi;

            await _context.SaveChangesAsync();

            var products = await _context.Urunler.ToListAsync();
            await _hubContext.Clients.All.SendAsync("Currency Updated", products);

            return Ok(urun);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var urun = await _context.Urunler.FindAsync(id);
            if (urun == null)
                return NotFound($"ID'si {id} olan ürün bulunamadı.");

            _context.Urunler.Remove(urun);
            await _context.SaveChangesAsync();

            var products = await _context.Urunler.ToListAsync();
            await _hubContext.Clients.All.SendAsync("Currency Updated", products);

            return Ok($"{urun.UrunAdi} başarıyla silindi.");
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
                return StatusCode(500, "Kur bilgisi şu an alınamıyor.");
            }
        }
    }
}
namespace StokTakipAPI.Models
{
    public class Urun
    {
        public int Id { get; set; }
        public string UrunAdi { get; set; } = "";
        public int Stok { get; set; }
        public decimal FiyatUsd { get; set; }

        public int[] SatisGecmisi { get; set; } = new int[0];
    }
}
class Barchart {

  /**
   * Konstruktor class dengan konfigurasi dasar chart
   * @param {Object} _config - Konfigurasi visualisasi
   * @param {Array} _data - Data yang akan divisualisasikan
   */
  constructor(_config, _data) {
    // Konfigurasi default jika tidak diberikan oleh pengguna
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 70, right: 50, bottom: 100, left: 50 }
    };

    this.data = _data;

    this.initVis(); // Inisialisasi visualisasi
  }

  /**
   * Fungsi ini berisi semua kode yang hanya dijalankan satu kali di awal.
   * Digunakan untuk menginisialisasi skala, sumbu, dan elemen statis seperti judul sumbu.
   */
  initVis() {
    let vis = this;

    // Hitung ukuran area gambar dalam (chart), setelah dikurangi margin
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Inisialisasi skala X dan Y
    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .padding(0.1); // Jarak antar batang

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]); // 0 di bawah

    // Inisialisasi sumbu X dan Y
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    // Buat elemen SVG utama
    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Grup utama yang berisi chart, diposisikan sesuai margin
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Grup untuk sumbu X
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Judul sumbu X
    vis.xAxisTitle = vis.xAxisG.append("text")
      .attr("y", 20)
      .attr("x", vis.width / 2)
      .attr("dy", "2.5em")
      .attr('fill', 'black')
      .attr('class', 'axis-label x')
      .style("text-anchor", "middle")
      .text("State");

    // Grup untuk sumbu Y
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // Judul sumbu Y
    vis.yAxisTitle = vis.yAxisG.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -vis.config.margin.top + 20)
      .attr("x", -vis.height / 2)
      .attr("dy", "1em")
      .attr('fill', 'black')
      .style("text-anchor", "middle")
      .text("Percent Drinking");
  }

  /**
   * Fungsi untuk mempersiapkan data sebelum divisualisasikan.
   * Biasanya dipanggil saat data baru dimasukkan atau ketika filter berubah.
   */
  updateVis() {
    let vis = this;

    // Tentukan cara mengambil nilai dari data untuk sumbu X dan Y
    vis.xValue = d => d.state;
    vis.yValue = d => d.percent;

    // Tetapkan domain skala berdasarkan data
    vis.xScale.domain(vis.data.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);

    // Panggil fungsi untuk menggambar visualisasi
    vis.renderVis();
  }

  /**
   * Fungsi untuk menggambar elemen visual (binding data ke elemen SVG).
   * Dipanggil setiap kali data atau konfigurasi berubah.
   */
  renderVis() {
    let vis = this;

    // Data binding ke elemen 'rect' (batang)
    let bars = vis.chart.selectAll('.bar')
      .data(vis.data);

    // Elemen yang masuk (enter selection)
    let barEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar');

    // Merge antara data baru dan data lama (update + enter)
    barEnter.merge(bars)
      .attr('x', d => vis.xScale(vis.xValue(d)))
      .attr('width', vis.xScale.bandwidth())
      .transition().duration(500).delay((d, i) => i * 5) // Animasi
      .attr('y', d => vis.yScale(vis.yValue(d)))
      .attr('height', d => vis.height - vis.yScale(vis.yValue(d)));

    // Hapus elemen yang tidak lagi dibutuhkan (exit selection)
    bars.exit().remove();

    // Update sumbu karena skala bisa saja berubah
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}

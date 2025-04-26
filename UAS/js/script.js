// Load CSV data
d3.csv("flight_dataset.csv").then(data => {
  // Preprocessing data
  data.forEach(d => {
    d.Price = +d.Price;
    d.Dep_hours = +d.Dep_hours;
    d.Dep_min = +d.Dep_min;
    d.Duration_hours = +d.Duration_hours;
    d.Duration_min = +d.Duration_min;
    d.Dep_Time = new Date(0, 0, 0, d.Dep_hours, d.Dep_min); // Jam Keberangkatan
    d.DurationMinutes = (d.Duration_hours * 60) + d.Duration_min; // Durasi dalam menit
  });

  // Tentukan halaman berdasarkan ID <body>
  const bodyId = document.body.id;
  
  if (bodyId === "bar") {
    drawBarChart(data);
  } else if (bodyId === "pie") {
    drawPieChart(data);
  } else if (bodyId === "line") {
    drawLineChart(data);
  } else if (bodyId === "scatter") {
    drawScatterPlot(data);
  }
});

// --- BAR CHART: Rata-rata Harga per Maskapai ---
function drawBarChart(data) {
  const svg = d3.select("#chart").append("svg")
    .attr("width", 600)
    .attr("height", 500);

  const margin = {top: 60, right: 20, bottom: 90, left: 60}; // Perbesar bottom untuk label X
  const width = 600 - margin.left - margin.right ;
  const height = 450 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const airlineData = d3.rollup(data, v => d3.mean(v, d => d.Price), d => d.Airline);
  const airlines = Array.from(airlineData, ([Airline, AvgPrice]) => ({Airline, AvgPrice}));

  const x = d3.scaleBand()
    .domain(airlines.map(d => d.Airline))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(airlines, d => d.AvgPrice)])
    .nice()
    .range([height, 0]);

  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  g.selectAll(".bar")
    .data(airlines)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Airline))
    .attr("y", d => y(d.AvgPrice))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.AvgPrice))
    .attr("fill", "#4e79a7");

  svg.append("text")
    .attr("x", 300)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Rata-Rata Harga Tiket per Maskapai");

  // Label X
  svg.append("text")
    .attr("x", 300)
    .attr("y", 440)
    .attr("text-anchor", "middle")
    .text("Maskapai");

  // Label Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -225)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Harga Rata-Rata (Rupee)");
}

// --- PIE CHART: Distribusi Jumlah Penerbangan per Total Stops ---
function drawPieChart(data) {
  const svg = d3.select("#chart").append("svg")
    .attr("width", 600)
    .attr("height", 450)
    .append("g")
    .attr("transform", "translate(300,250)");

  const stopData = d3.rollup(data, v => v.length, d => d.Total_Stops);
  const stops = Array.from(stopData, ([Stop, Count]) => ({Stop, Count}));

  const pie = d3.pie().value(d => d.Count);
  const arc = d3.arc().innerRadius(0).outerRadius(150);

  const color = d3.scaleOrdinal(d3.schemeSet2);

  svg.selectAll('path')
    .data(pie(stops))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.Stop))
    .attr('stroke', 'white')
    .style('stroke-width', '2px');

  svg.selectAll('text')
    .data(pie(stops))
    .enter()
    .append('text')
    .text(d => d.data.Stop)
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .style('text-anchor', 'middle')
    .style('font-size', 12);

  d3.select("#chart svg")
    .append("text")
    .attr("x", 300)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Distribusi Jumlah Penerbangan berdasarkan Total Stops");
}

// --- LINE CHART: Rata-Rata Harga berdasarkan Durasi ---
function drawLineChart(data) {
  const svg = d3.select("#chart").append("svg")
    .attr("width", 600)
    .attr("height", 450);

  const margin = {top: 60, right: 20, bottom: 70, left: 60}; // Tambah margin bottom
  const width = 600 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const durationData = d3.rollup(data, v => d3.mean(v, d => d.Price), d => d.DurationMinutes);
  const durations = Array.from(durationData, ([Duration, AvgPrice]) => ({Duration, AvgPrice}))
    .sort((a, b) => a.Duration - b.Duration);

  const x = d3.scaleLinear()
    .domain(d3.extent(durations, d => d.Duration))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(durations, d => d.AvgPrice)])
    .nice()
    .range([height, 0]);

  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  const line = d3.line()
    .x(d => x(d.Duration))
    .y(d => y(d.AvgPrice));

  g.append("path")
    .datum(durations)
    .attr("fill", "none")
    .attr("stroke", "#e15759")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.append("text")
    .attr("x", 300)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Rata-Rata Harga Tiket Berdasarkan Durasi Penerbangan (menit)");

  // Label X
  svg.append("text")
    .attr("x", 300)
    .attr("y", 440)
    .attr("text-anchor", "middle")
    .text("Durasi (menit)");

  // Label Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -225)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Harga Rata-Rata (Rupee)");
}

// --- SCATTER PLOT: Jam Keberangkatan vs Harga ---
function drawScatterPlot(data) {
  const svg = d3.select("#chart").append("svg")
    .attr("width", 600)
    .attr("height", 450);

  const margin = {top: 60, right: 20, bottom: 70, left: 60}; // Tambah margin bawah
  const width = 600 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, 24])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Price)])
    .nice()
    .range([height, 0]);

  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(24));

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Dep_Time.getHours()))
    .attr("cy", d => y(d.Price))
    .attr("r", 4)
    .attr("fill", "#59a14f")
    .attr("opacity", 0.7);

  svg.append("text")
    .attr("x", 300)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Hubungan Jam Keberangkatan dan Harga Tiket");

  // Label X
  svg.append("text")
    .attr("x", 300)
    .attr("y", 440)
    .attr("text-anchor", "middle")
    .text("Jam Keberangkatan (0-24)");

  // Label Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -225)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Harga Tiket (Rupee)");
}

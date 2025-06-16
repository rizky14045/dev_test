<script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import axios from 'axios';
  import Chart from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';

  Chart.register(ChartDataLabels);

  const chart = ref(null);
  const grafik = ref({ labels: [], data: [] });
  const table = ref({ labels: [], datasets: [] });
  const areaOptions = ref([]);
  const barChartRef = ref(null);
  const filters = ref({
    area: '0',
    start_date: '',
    end_date: ''
  });

  // GET AREA OPTIONS
  const fetchAreaOptions = async () => {
    try {
      const res = await axios.get('http://localhost:8090/get-area');
      areaOptions.value = res.data.area;
    } catch (err) {
      console.error('Gagal memuat daftar area:', err);
    }
  };

  // GET CHART & TABLE DATA
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8090/chart', {
        params: filters.value
      });

      const dataJson = res.data.data;

      if (dataJson?.grafik?.labels?.length > 0) {
        grafik.value = dataJson.grafik;
        table.value = dataJson.tabel;

        await nextTick();
        renderChart();
      } else {
        grafik.value = { labels: [], data: [] };
        table.value = { labels: [], datasets: [] };

        if (chart.value) {
          chart.value.destroy();
          chart.value = null;
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data chart:', err);
    }
  };

  // RENDER CHART.JS
  const renderChart = () => {
    const ctx = barChartRef.value;
    if (!ctx) return;

    if (chart.value) {
      chart.value.destroy();
    }

    chart.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: grafik.value.labels,
        datasets: [{
          label: 'Compliance (%)',
          data: grafik.value.data,
          backgroundColor: '#42A5F5'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            color: '#000',
            anchor: 'end',
            align: 'top',
            font: {
              weight: 'bold',
              size: 12
            },

          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Percentage (%)'
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  };

  onMounted(() => {
    fetchAreaOptions();
  });
</script>

<template>
  <div class="container">
    <h2>Dashboard</h2>

    <form @submit.prevent="fetchData">
      <div class="filter-group">
        <label>Area:</label>
        <select v-model="filters.area">
          <option value="0">Semua Area</option>
          <option v-for="area in areaOptions" :key="area.area_id" :value="area.area_id">
            {{ area.area_name }}
          </option>
        </select>

        <label>Start Date:</label>
        <input type="date" v-model="filters.start_date" />

        <label>End Date:</label>
        <input type="date" v-model="filters.end_date" />

        <button type="submit">Filter</button>
      </div>
    </form>

    <!-- GUNAKAN ref UNTUK MENGAKSES CANVAS -->
    <canvas ref="barChartRef" v-show="grafik.labels.length"></canvas>

    <table v-if="table.labels.length" border="1">
      <thead>
        <tr>
          <th>Brand</th>
          <th v-for="label in table.labels" :key="label">{{ label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dataset in table.datasets" :key="dataset.label">
          <td>{{ dataset.label }}</td>
          <td v-for="(value, index) in dataset.data" :key="index">{{ value }}%</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Tidak ada data ditemukan.</p>
  </div>
</template>



<style>
  .container {
    padding: 20px;
    max-width: 1000px;
    margin: auto;
    font-family: Arial, sans-serif;
  }

  canvas {
    margin: 30px 0;
    width: 100% !important;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
  }

  input, select, button {
    padding: 6px 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }

  th, td {
    padding: 8px 12px;
    text-align: center;
  }
</style>

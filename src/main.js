import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './styles/main.css';

// Inisialisasi Chart.js secara global agar komponen grafik dapat digunakan
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement 
} from 'chart.js';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement
);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

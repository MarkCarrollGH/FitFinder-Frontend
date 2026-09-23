import axios from 'axios';

const awsClothes = process.env.NEXT_PUBLIC_RECOM_AWS;

async function api(props) {
  try {
    const { data } = await axios.get(`${awsClothes}/${props}/get`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message = typeof error.response?.data === 'string' ? error.response.data : error.message;
    throw new Error(detail || message);
  }
}

export default api;

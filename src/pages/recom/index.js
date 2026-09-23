import { useState } from 'react';
import axios from 'axios';
import classes from '../../styles/recom.module.css';
import Cookies from 'js-cookie';

const FORMALITY_OPTIONS = ['fancy', 'casual', 'business', 'evening'];
const TEMPERATURE_OPTIONS = ['warm', 'cool', 'light'];
const COLOUR_OPTIONS = ['bright', 'dark', 'colourful'];
const STYLE_OPTIONS = ['minimalist', 'vintage', 'modern', 'floral'];

function normalizeImageSrc(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/^['"]+|['"]+$/g, '');
}

function RecomPage() {
  const [recommend, setRecommend] = useState(null);
  const [formality, setFormality] = useState('');
  const [temperature, setTemperature] = useState('');
  const [colour, setColour] = useState('');
  const [style, setStyle] = useState('');

  const isReady = formality && temperature && colour && style;

  const getRecommendations = async () => {
    if (!isReady) {
      alert('Please select an option from each dropdown.');
      return;
    }

    const [c1, c2, c3, c4] = [formality, temperature, colour, style].map(encodeURIComponent);

    try {
      const { data } = await axios.get(`/recom/${c1}/${c2}/${c3}/${c4}/getrecom`);
      setRecommend(data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert(error.response?.data?.detail || 'Network error getting recommendations');
    }
  };

  const like = async () => {
    if (!Cookies.get('user_id')) {
      alert('Please sign in to like outfits.');
      return;
    }
    try {
      await axios.post('/user/likes', {
        uid: Cookies.get('user_id'),
        item_id1: recommend?.id1,
        item_id2: recommend?.id2,
        item_id3: recommend?.id3,
        item_id4: recommend?.id4,
      });
      await axios.post('/recom/like', {
        id1: recommend?.id1,
        id2: recommend?.id2,
        id3: recommend?.id3,
        id4: recommend?.id4,
        attr1: formality,
        attr2: temperature,
        attr3: colour,
        attr4: style,
      });
      alert('Outfit liked!');
    } catch (error) {
      console.error('Error liking outfit:', error);
      alert(error.response?.data?.detail || 'Network error liking outfit');
    }
  };

  const dislike = async () => {
    try {
      await axios.post('/recom/dislike', {
        id1: recommend?.id1,
        id2: recommend?.id2,
        id3: recommend?.id3,
        id4: recommend?.id4,
        attr1: formality,
        attr2: temperature,
        attr3: colour,
        attr4: style,
      });
      getRecommendations();
    } catch (error) {
      console.error('Error disliking outfit:', error);
      alert(error.response?.data?.detail || 'Network error disliking outfit');
    }
  };

  const recommendationItems = [1, 2, 3, 4]
    .map((index) => {
      const name = recommend?.[`name${index}`];
      const image = normalizeImageSrc(
        recommend?.[`image${index}`]
        || recommend?.[`img_url${index}`]
        || recommend?.[`img${index}`]
        || recommend?.[`url${index}`]
      );

      if (!name && !image) {
        return null;
      }

      return {
        id: index,
        name: name || `Look ${index}`,
        image,
      };
    })
    .filter(Boolean);

  return (
    <div className={classes.container}>
      <h1>Find your perfect outfit</h1>
      <div className={classes.dropdownRow}>
        {[
          { label: 'Formality', options: FORMALITY_OPTIONS, value: formality, set: setFormality },
          { label: 'Temperature', options: TEMPERATURE_OPTIONS, value: temperature, set: setTemperature },
          { label: 'Colour', options: COLOUR_OPTIONS, value: colour, set: setColour },
          { label: 'Style', options: STYLE_OPTIONS, value: style, set: setStyle },
        ].map(({ label, options, value, set }) => (
          <div key={label} className={classes.dropdownCard}>
            <span className={classes.dropdownLabel}>{label}</span>
            <div className={classes.pillGroup}>
              {options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`${classes.pill} ${value === o ? classes.pillActive : ''}`}
                  onClick={() => set(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={getRecommendations}
          className={classes.deleteBtn}
          disabled={!isReady}
        >
          Get Recommendations
        </button>
      </div>

      <div className={classes.resultsSection}>

        <div className={classes.recommendationGrid}>
          {recommendationItems.map((item) => (
            <article key={item.id} className={classes.recommendationCard}>
              <div className={classes.recommendationImageWrap}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={classes.recommendationImage}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={classes.imageFallback}>No image available</div>
                )}
              </div>
              <div className={classes.recommendationContent}>
                <span className={classes.recommendationLabel}>Item {item.id}</span>
                <h3>{item.name}</h3>
              </div>
            </article>
          ))}
        </div>

        {recommendationItems.length > 0 && (
          <div className={classes.likeRow}>
            <button onClick={like} className={classes.likeBtn}>👍</button>
            <button onClick={dislike} className={classes.dislikeBtn}>👎</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecomPage;

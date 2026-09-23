import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import styles from '../../styles/user.module.css';

function UserPage() {
  const [user, setUser] = useState(null);
  const [likeSets, setLikeSets] = useState([]);
  const [likesLoading, setLikesLoading] = useState(true);
  const [generatedImages, setGeneratedImages] = useState({});
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [generatingIndex, setGeneratingIndex] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const user_id = Cookies.get('user_id');
  const router = useRouter();

  const logout = () => {
    Cookies.remove('user_id');
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
    if (!user_id) { setError('No user session found.'); return; }

    axios.get(`/user/users/${user_id}`)
      .then(({ data }) => { console.log('user:', data); setUser(data); })
      .catch((e) => { console.error('user error:', e); setError('Failed to load user information.'); });

    axios.get(`/user/likes/${user_id}`)
      .then(({ data }) => {
        console.log('likes:', data);
        const sets = data.map(set => {
          const ids = Object.entries(set)
            .filter(([key]) => key.startsWith('item_id'))
            .map(([, val]) => val)
            .filter(Boolean);
          return { items: [], rawIds: ids, lid: set.id, loading: true };
        });
        setLikeSets(sets);
        sets.forEach((set, i) => {
          Promise.all(set.rawIds.map(id => axios.get(`/clothes/geto/${id}`).then(r => r.data)))
            .then(items => {
              setLikeSets(prev => prev.map((s, idx) => idx === i ? { ...s, items, loading: false } : s));
            })
            .catch(() => {
              setLikeSets(prev => prev.map((s, idx) => idx === i ? { ...s, loading: false } : s));
            });
        });
      })
      .catch((e) => { console.error('likes error:', e); })
      .finally(() => setLikesLoading(false));
  }, []);

  const edit = async () => {
    await axios.put(`user/users/${user.id}`, {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });
    setEditing(false);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`/user/${user.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user, img_status: true });
    } catch (e) {
      console.error('upload error:', e);
      alert(e.response?.data?.detail || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    try {
      await axios.delete(`/user/${user.id}/upload`);
      setUser({ ...user, img_status: false });
    } catch (e) {
      console.error('delete image error:', e);
      alert(e.response?.data?.detail || 'Failed to delete image.');
    }
  };



  const deleteLike = async (lid, i) => {
    try {
      await axios.delete(`/user/likes/${lid}`);
      setLikeSets(prev => prev.filter((_, index) => index !== i));
    } catch (e) {
      console.error('delete like error:', e);
      alert(e.response?.data?.detail || 'Failed to delete like.');
    }
  };

  const generate = async (rawIds, index) => {
    const payload = { uid: user.id };
    rawIds.forEach((id, i) => { payload[`item_id${i + 1}`] = id; });
    setGeneratingIndex(index);
    try {
      const { data } = await axios.post('/user/generate', payload, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      setGeneratedImages(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      console.error('generate error:', e);
      alert(e.response?.data?.detail || 'Failed to generate image.');
    } finally {
      setGeneratingIndex(null);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`user/delete/${user.id}`);
      logout();
    } catch (e) {
      console.error('delete error:', e);
      alert('Failed to delete account. Please try again later.');
    }
  }

  if (!mounted) return null;
  if (error) return <p style={{ textAlign: 'center', color: '#c0392b', marginTop: '3rem' }}>{error}</p>;
  if (!user) return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</p>;

  return (
    <div className={styles.page}>

      {/* User Info */}
      <div className={styles.card}>
        <h1 className={styles.title}>Your Profile</h1>
        <div className={styles.fields}>
          {editing ? (
            <>
              <EditField label="First Name" value={user.first_name} onChange={(v) => setUser({ ...user, first_name: v })} />
              <EditField label="Last Name" value={user.last_name} onChange={(v) => setUser({ ...user, last_name: v })} />
              <EditField label="Email" value={user.email} onChange={(v) => setUser({ ...user, email: v })} />
            </>
          ) : (
            <>
              <Field label="First Name" value={user.first_name} />
              <Field label="Last Name" value={user.last_name} />
              <Field label="Email" value={user.email} />
            </>
          )}
        </div>
        <div className={styles.profileActions}>
          {editing ? (
            <>
              <button onClick={edit} className={styles.saveBtn}>Save</button>
              <button onClick={() => setEditing(false)} className={styles.cancelBtn}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className={styles.editBtn}>Edit Profile</button>
          )}
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          <button onClick={deleteAccount} className={styles.deleteBtn}>Delete Account</button>
        </div>
        <div className={styles.uploadSection}>
          <span className={styles.fieldLabel}>Profile Image</span>
          <p className={styles.aiWarning}>⚠️ Please note that the image you upload will be used by AI.</p>
          {user.img_status ? (
            <button onClick={deleteImage} className={styles.deleteBtn}>Delete Image</button>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
              className={styles.fileInput}
            />
          )}
        </div>
      </div>

      {/* Liked Sets */}
      <div className={styles.card}>
        <h2 className={styles.title}>Liked Outfits</h2>
        {likesLoading ? (
          <div className={styles.spinner} style={{ margin: '1rem auto' }} />
        ) : likeSets.length === 0 ? (
          <p className={styles.empty}>No liked outfits yet.</p>
        ) : (
          <div className={styles.setsList}>
            {likeSets.map((set, i) => (
              <div key={i} className={styles.outfitSet}>
                <div className={styles.outfitHeader}>
                  <p className={styles.outfitLabel}>Outfit {i + 1}</p>
                  <button onClick={() => deleteLike(set.lid, i)} className={styles.deleteLikeBtn}>🗑</button>
                </div>
                {set.loading ? (
                  <div className={styles.spinner} style={{ margin: '1rem auto' }} />
                ) : (
                <div className={styles.outfitGrid}>
                  {set.items.map((item) => (
                    <div key={item.id} className={styles.itemCard}>
                      <img src={item.img_url} alt={item.name} />
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemBrand}>{item.brand}</p>
                      </div>
                    </div>
                  ))}
                  {generatedImages[i] ? (
                    <div className={styles.itemCard} onClick={() => setLightboxSrc(generatedImages[i])} style={{ cursor: 'zoom-in' }}>
                      <img src={generatedImages[i]} alt="Generated outfit" />
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>Your Look</p>
                      </div>
                    </div>
                  ) : generatingIndex === i ? (
                    <div className={styles.generateBtn}>
                      <div className={styles.spinner} />
                    </div>
                  ) : user.img_status ? (
                    <button onClick={() => generate(set.rawIds, i)} className={styles.generateBtn}>✨ Generate</button>
                  ) : (
                    <div className={styles.generateBtn} style={{ fontSize: '0.8rem', padding: '0.5rem', textAlign: 'center' }}>Please upload a photo to see the outfit</div>
                  )}
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <div className={styles.lightbox} onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="Generated outfit large" className={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value }) => (
  <div className={styles.fieldWrapper}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldValue}>{value || '—'}</span>
  </div>
);

const EditField = ({ label, value, onChange }) => (
  <div className={styles.fieldWrapper}>
    <span className={styles.fieldLabel}>{label}</span>
    <input className={styles.fieldInput} value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default UserPage;

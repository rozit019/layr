import { useEffect, useState } from 'react';
import { categories as allCategories, getCategory } from '../data/catalog.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { apiRequest, normalizeTemplate } from '../lib/api.js';
import { formatPrice } from '../utils/formatPrice.js';
import './AdminPage.css';

const blankForm = { name: '', slug: '', category: 'portfolio', description: '', price: '', techStack: 'HTML / CSS', coverImage: '', file: null };
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminPage({ onCategoriesChanged, categorySettings, categoryMode, onToggleCategory }) {
  const { token, user } = useAuth();
  const [form, setForm] = useState(blankForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadTemplates() {
    setLoadingTemplates(true);
    try {
      const payload = await apiRequest('/templates', { token });
      setTemplates((payload.templates || []).map(normalizeTemplate));
    } catch (err) {
      setError(err.message || 'Could not load the template list.');
    } finally {
      setLoadingTemplates(false);
    }
  }

  useEffect(() => { loadTemplates(); }, [token]);

  function updateField(event) {
    const { name, value, files } = event.target;
    if (name === 'file') {
      setForm((current) => ({ ...current, file: files?.[0] || null }));
      return;
    }
    if (name === 'slug') setSlugTouched(true);
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !slugTouched ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!form.file) { setError('Choose the template ZIP file to upload.'); return; }
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('slug', slugify(form.slug || form.name));
    body.append('category', form.category);
    body.append('description', form.description.trim());
    body.append('price', String(form.price));
    body.append('techStack', form.techStack.trim());
    body.append('coverImage', form.coverImage.trim());
    body.append('file', form.file);

    setBusy(true);
    try {
      const payload = await apiRequest('/templates', { method: 'POST', token, body });
      setNotice(`${payload.template?.name || form.name} has been added.`);
      setForm(blankForm);
      setSlugTouched(false);
      const fileInput = document.querySelector('#admin-template-file');
      if (fileInput) fileInput.value = '';
      await loadTemplates();
      onCategoriesChanged?.();
    } catch (err) {
      setError(err.message || 'Could not add the template.');
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(template) {
    if (!window.confirm(`Deactivate “${template.title}”? It will no longer appear in the public catalogue.`)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/templates/${encodeURIComponent(template.slug)}`, { method: 'DELETE', token });
      setNotice(`${template.title} was deactivated.`);
      await loadTemplates();
      onCategoriesChanged?.();
    } catch (err) {
      setError(err.message || 'Could not deactivate this template.');
    }
  }

  async function toggleCategory(category, isEnabled) {
    setError('');
    setNotice('');
    try {
      const result = await onToggleCategory(category.key, isEnabled);
      setNotice(result?.persisted
        ? `${category.label} is ${isEnabled ? 'visible' : 'hidden'} in the storefront.`
        : `${category.label} is hidden in this browser preview. Add the category settings route to save this for everyone.`);
    } catch (err) {
      setError(err.message || 'Could not update that category.');
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-heading"><div className="container admin-heading-inner"><div><p className="eyebrow"><span className="eyebrow-dot" /> ADMIN WORKSPACE</p><h1>Make the catalogue<br /><em>your own.</em></h1><p>Signed in as {user?.name || user?.email}. Upload templates and decide which collections are open.</p></div><span className="admin-role-chip">ADMIN ACCOUNT</span></div></section>

      <div className="container admin-layout">
        <section className="admin-panel category-control-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">STOREFRONT NAVIGATION</p><h2>Collection visibility</h2></div><span className={`sync-pill${categoryMode === 'api' ? ' sync-pill--live' : ''}`}><i />{categoryMode === 'api' ? 'Saved to backend' : 'Local preview'}</span></div>
          <p className="admin-panel-copy">Turn a collection off to remove it from the header, home page, and category listings.</p>
          <div className="category-switch-list">
            {allCategories.map((category) => {
              const enabled = categorySettings[category.key] !== false;
              return <label className="category-switch-row" key={category.key}><span className={`switch-category-icon switch-category-icon--${category.key}`}>{category.icon}</span><span className="switch-category-copy"><b>{category.title}</b><small>{category.label}</small></span><span className="switch-control"><input type="checkbox" checked={enabled} onChange={(event) => toggleCategory(category, event.target.checked)} /><i /></span></label>;
            })}
          </div>
        </section>

        <section className="admin-panel add-template-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">NEW DIGITAL PRODUCT</p><h2>Add a template</h2></div><span className="private-file-tag">PRIVATE ZIP UPLOAD</span></div>
          <p className="admin-panel-copy">Add the listing details, upload the ZIP, and it will appear in the matching storefront collection.</p>
          <form className="admin-template-form" onSubmit={handleCreate}>
            <label>Template name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Birthday in Bloom" required /></label>
            <label>URL slug<input name="slug" value={form.slug} onChange={updateField} placeholder="birthday-in-bloom" required /></label>
            <label>Collection<select name="category" value={form.category} onChange={updateField} required>{allCategories.map((category) => <option value={category.key} key={category.key}>{category.label}</option>)}</select></label>
            <label>Price in Nepalese rupees<input name="price" type="number" min="0" step="1" value={form.price} onChange={updateField} placeholder="1800" required /><small>eSewa checkout currently charges in NPR.</small></label>
            <label className="admin-full-field">Description<textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="What does the buyer get?" required /></label>
            <label>Built with<input name="techStack" value={form.techStack} onChange={updateField} placeholder="HTML / CSS" /></label>
            <label>Cover image URL<input name="coverImage" type="url" value={form.coverImage} onChange={updateField} placeholder="https://…" /><small>Optional public preview image URL.</small></label>
            <label className="admin-file-field admin-full-field">Template ZIP<input id="admin-template-file" name="file" type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={updateField} required /><small>{form.file ? `${form.file.name} · ${(form.file.size / 1024 / 1024).toFixed(1)} MB` : 'The backend enforces the upload limit. The ZIP is stored privately.'}</small></label>
            {error && <p className="admin-message admin-message--error" role="alert">{error}</p>}
            {notice && <p className="admin-message admin-message--success" role="status">{notice}</p>}
            <button className="button button-dark admin-submit" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Add template'} <span>↗</span></button>
          </form>
        </section>

        <section className="admin-panel admin-template-list-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">YOUR ACTIVE PRODUCTS</p><h2>Template catalogue</h2></div><button className="admin-refresh" type="button" onClick={loadTemplates}>Refresh ↻</button></div>
          {loadingTemplates ? <p className="admin-empty">Loading templates…</p> : templates.length ? <div className="admin-template-table-wrap"><table className="admin-template-table"><thead><tr><th>Template</th><th>Collection</th><th>Price</th><th>Action</th></tr></thead><tbody>{templates.map((template) => <tr key={template.slug}><td><b>{template.title}</b><small>/{template.slug}</small></td><td>{getCategory(template.category)?.label || template.category}</td><td>{formatPrice(template.price, 'NPR')}</td><td><button className="deactivate-button" type="button" onClick={() => deactivate(template)}>Deactivate</button></td></tr>)}</tbody></table></div> : <p className="admin-empty">No active templates yet. Add your first ZIP above.</p>}
        </section>
      </div>
    </main>
  );
}

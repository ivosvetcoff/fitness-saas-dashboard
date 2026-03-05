import os

css = """
/* ========================================= */
/* SOCIAL NETWORK (FITGRAM)                  */
/* ========================================= */
.st-post-card {
  background: var(--bg-sidebar);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.st-post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
}

.st-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.st-post-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: #121214;
}

.st-post-actions {
  display: flex;
  padding: 12px 16px;
  gap: 16px;
  border-bottom: 1px solid var(--border-color);
}

.st-post-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0;
  transition: all 0.2s;
}

.st-post-action-btn.liked {
  color: #10B981;
}

.st-post-caption {
  padding: 12px 16px 16px;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.st-profile-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  margin-top: 24px;
}

.st-grid-item {
  aspect-ratio: 1;
  background: var(--bg-sidebar);
  cursor: pointer;
  overflow: hidden;
}

.st-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.st-grid-item:hover img {
  transform: scale(1.05);
}

.placeholder-grid-item {
  width: 100%;
  height: 100%;
  background: var(--bg-input);
}
"""

with open(r"c:\Users\pcing\OneDrive\Escritorio\Ivo\Fitness\dashboard-profesor\src\index.css", "a", encoding="utf-8") as f:
    f.write(css)

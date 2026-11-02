"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Gamepad2, Star, Eye } from "lucide-react";
import Image from "next/image";

interface GameItem {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  category: string;
  logo: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  sort: number;
  _count?: { packages: number; orders: number };
}

interface AdminGamesManagerProps {
  initialGames: GameItem[];
}

export function AdminGamesManager({ initialGames }: AdminGamesManagerProps) {
  const [games, setGames] = useState<GameItem[]>(initialGames);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("mobile");
  const [formLogo, setFormLogo] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSort, setFormSort] = useState(0);

  const resetForm = () => {
    setFormName("");
    setFormNameEn("");
    setFormSlug("");
    setFormCategory("mobile");
    setFormLogo("");
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormSort(0);
    setEditingGame(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (g: GameItem) => {
    setEditingGame(g);
    setFormName(g.name);
    setFormNameEn(g.nameEn || "");
    setFormSlug(g.slug);
    setFormCategory(g.category);
    setFormLogo(g.logo || "");
    setFormIsActive(g.isActive);
    setFormIsFeatured(g.isFeatured);
    setFormSort(g.sort);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingGame) {
        // Update
        const res = await fetch(`/api/admin/games/${editingGame.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            nameEn: formNameEn,
            category: formCategory,
            logo: formLogo,
            isActive: formIsActive,
            isFeatured: formIsFeatured,
            sort: formSort,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "আপডেট ব্যর্থ হয়েছে");

        setGames((prev) =>
          prev.map((g) => (g.id === editingGame.id ? { ...g, ...data.game } : g))
        );
        toast.success("✅ গেম সফলভাবে আপডেট করা হয়েছে");
      } else {
        // Create
        const res = await fetch("/api/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            nameEn: formNameEn,
            slug: formSlug,
            category: formCategory,
            logo: formLogo,
            isActive: formIsActive,
            isFeatured: formIsFeatured,
            sort: formSort,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "গেম তৈরি ব্যর্থ হয়েছে");

        setGames((prev) => [data.game, ...prev]);
        toast.success("✅ নতুন গেম সফলভাবে যুক্ত করা হয়েছে");
      }

      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (g: GameItem) => {
    try {
      const res = await fetch(`/api/admin/games/${g.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !g.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGames((prev) =>
        prev.map((item) => (item.id === g.id ? { ...item, isActive: !g.isActive } : item))
      );
      toast.success(g.isActive ? "গেম নিষ্ক্রিয় করা হয়েছে" : "গেম সক্রিয় করা হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            গেম ক্যাটালগ ম্যানেজমেন্ট
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            গেম যোগ করুন, রেট ও ফিল্ডস কনফিগার করুন এবং লাইভ দৃশ্যমানতা নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}
        >
          <Plus style={{ width: "18px", height: "18px" }} />
          নতুন গেম যোগ করুন
        </button>
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>আইকন</th>
                <th>গেমের নাম</th>
                <th>স্লাগ (Slug)</th>
                <th>ক্যাটাগরি</th>
                <th>প্যাকেজ সংখ্যা</th>
                <th>স্ট্যাটাস</th>
                <th>ফিচার্ড</th>
                <th style={{ textAlign: "right" }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td style={{ width: "48px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.05)",
                        position: "relative",
                      }}
                    >
                      <Image
                        src={g.logo || `/games/${g.slug}.jpg`}
                        alt={g.name}
                        width={40}
                        height={40}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{g.name}</strong>
                    {g.nameEn && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                        {g.nameEn}
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>
                    {g.slug}
                  </td>
                  <td>
                    <span className="badge" style={{ textTransform: "capitalize" }}>
                      {g.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>
                    {g._count?.packages ?? "—"} টি
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(g)}
                      className={`badge ${g.isActive ? "badge-lime" : "badge-red"}`}
                      style={{ cursor: "pointer", border: "none", background: g.isActive ? "rgba(163,230,53,0.15)" : "rgba(239,68,68,0.15)" }}
                    >
                      {g.isActive ? "সক্রিয়" : "বন্ধ"}
                    </button>
                  </td>
                  <td>
                    {g.isFeatured ? (
                      <span className="badge badge-cyan">Featured</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit style={{ width: "14px", height: "14px" }} />
                        এডিট
                      </button>
                      <a
                        href={`/games/${g.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Eye style={{ width: "14px", height: "14px" }} />
                        ভিউ
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="glass-card"
            style={{ width: "100%", maxWidth: "560px", padding: "28px", borderRadius: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                {editingGame ? "গেম তথ্য সম্পাদনা" : "নতুন গেম যোগ করুন"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  গেমের নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g. ফ্রি ফায়ার ডায়মন্ড"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ইংরেজি নাম
                  </label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. Free Fire Diamond"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    স্লাগ (URL Slug) *
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    disabled={!!editingGame}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace" }}
                    placeholder="e.g. free-fire"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    <option value="mobile">মোবাইল গেম (Mobile)</option>
                    <option value="pc">পিসি গেম (PC)</option>
                    <option value="card">গিফট কার্ড (Card)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    সর্ট ক্রম (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={formSort}
                    onChange={(e) => setFormSort(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  লোগো / ইমেজ পাথ
                </label>
                <input
                  type="text"
                  value={formLogo}
                  onChange={(e) => setFormLogo(e.target.value)}
                  className="input"
                  style={{ width: "100%", fontFamily: "monospace" }}
                  placeholder="e.g. /games/free-fire.jpg"
                />
              </div>

              <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ accentColor: "var(--accent-lime)" }}
                  />
                  সক্রিয় (Active)
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    style={{ accentColor: "var(--accent-cyan)" }}
                  />
                  Featured ব্যানার
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 18px" }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: "8px 24px", fontWeight: 700 }}
                >
                  {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

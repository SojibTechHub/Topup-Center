"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, TrendingUp, Package as PkgIcon, CheckCircle2, XCircle } from "lucide-react";

interface GameOption {
  id: string;
  name: string;
  slug: string;
}

interface PackageItem {
  id: string;
  gameId: string;
  name: string;
  amountLabel: string;
  pricePoisha: string;
  costPoisha: string | null;
  stock: number;
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  description: string | null; // badge
  sort: number;
  deliveryTime: string | null;
  game: { id: string; name: string; slug: string };
}

interface AdminPackagesManagerProps {
  initialPackages: PackageItem[];
  games: GameOption[];
  selectedGameId?: string;
}

export function AdminPackagesManager({ initialPackages, games, selectedGameId }: AdminPackagesManagerProps) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [filterGameId, setFilterGameId] = useState<string>(selectedGameId || "");
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form
  const [gameId, setGameId] = useState(games[0]?.id || "");
  const [name, setName] = useState("");
  const [amountLabel, setAmountLabel] = useState("");
  const [priceBdt, setPriceBdt] = useState<number>(0);
  const [costBdt, setCostBdt] = useState<number>(0);
  const [stock, setStock] = useState<number>(-1);
  const [isPopular, setIsPopular] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [badge, setBadge] = useState("");
  const [sort, setSort] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState("১-৫ মিনিট");

  const resetForm = () => {
    setEditingPkg(null);
    setGameId(games[0]?.id || "");
    setName("");
    setAmountLabel("");
    setPriceBdt(0);
    setCostBdt(0);
    setStock(-1);
    setIsPopular(false);
    setIsFeatured(false);
    setIsActive(true);
    setBadge("");
    setSort(0);
    setDeliveryTime("১-৫ মিনিট");
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (p: PackageItem) => {
    setEditingPkg(p);
    setGameId(p.gameId);
    setName(p.name);
    setAmountLabel(p.amountLabel);
    setPriceBdt(Number(p.pricePoisha) / 100);
    setCostBdt(p.costPoisha ? Number(p.costPoisha) / 100 : 0);
    setStock(p.stock);
    setIsPopular(p.isPopular);
    setIsFeatured(p.isFeatured);
    setIsActive(p.isActive);
    setBadge(p.description || "");
    setSort(p.sort);
    setDeliveryTime(p.deliveryTime || "১-৫ মিনিট");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPkg) {
        // Update
        const res = await fetch(`/api/admin/packages/${editingPkg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            amountLabel,
            priceBdt,
            costBdt,
            stock,
            isPopular,
            isFeatured,
            isActive,
            badge,
            sort,
            deliveryTime,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "আপডেট ব্যর্থ হয়েছে");

        setPackages((prev) =>
          prev.map((item) =>
            item.id === editingPkg.id ? { ...item, ...data.package, game: item.game } : item
          )
        );
        toast.success("✅ প্যাকেজ সফলভাবে আপডেট করা হয়েছে");
      } else {
        // Create
        const res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId,
            name,
            amountLabel,
            priceBdt,
            costBdt,
            stock,
            isPopular,
            isFeatured,
            badge,
            sort,
            deliveryTime,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "প্যাকেজ তৈরি ব্যর্থ হয়েছে");

        const targetGame = games.find((g) => g.id === gameId);
        const newPkg: PackageItem = {
          ...data.package,
          game: targetGame || { id: gameId, name: "Game", slug: "" },
        };

        setPackages((prev) => [...prev, newPkg]);
        toast.success("✅ নতুন প্যাকেজ সফলভাবে তৈরি হয়েছে");
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pkg: PackageItem) => {
    if (!confirm(`আপনি কি নিশ্চিত যে '${pkg.name}' প্যাকেজটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      toast.success("প্যাকেজ মুছে ফেলা হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "ডিলিট ব্যর্থ হয়েছে");
    }
  };

  const filtered = filterGameId
    ? packages.filter((p) => p.gameId === filterGameId)
    : packages;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            প্যাকেজ ও রেট ম্যানেজমেন্ট
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            ক্রয়মূল্য, বিক্রয়মূল্য ও মার্জিন প্রফিট সরাসরি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}
        >
          <Plus style={{ width: "18px", height: "18px" }} />
          নতুন প্যাকেজ যোগ করুন
        </button>
      </div>

      {/* Game Filter Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={() => setFilterGameId("")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            border: "none",
            cursor: "pointer",
            background: !filterGameId ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
            color: !filterGameId ? "#070A12" : "var(--text-secondary)",
            fontWeight: !filterGameId ? 700 : 400,
          }}
        >
          সব গেম ({packages.length})
        </button>
        {games.map((g) => {
          const count = packages.filter((p) => p.gameId === g.id).length;
          return (
            <button
              key={g.id}
              onClick={() => setFilterGameId(g.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                border: "none",
                cursor: "pointer",
                background: filterGameId === g.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
                color: filterGameId === g.id ? "#070A12" : "var(--text-secondary)",
                fontWeight: filterGameId === g.id ? 700 : 400,
              }}
            >
              {g.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>গেম</th>
                <th>প্যাকেজের নাম</th>
                <th>পরিমাণ</th>
                <th>ক্রয়মূল্য (Cost)</th>
                <th>বিক্রয়মূল্য (Sell)</th>
                <th>লাভ (Profit)</th>
                <th>মার্জিন</th>
                <th>স্টক</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: "right" }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => {
                const cost = Number(pkg.costPoisha || "0") / 100;
                const sell = Number(pkg.pricePoisha) / 100;
                const profit = sell - cost;
                const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : "0";

                return (
                  <tr key={pkg.id}>
                    <td>
                      <span className="badge" style={{ fontSize: "0.75rem" }}>
                        {pkg.game?.name || "Game"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{pkg.name}</strong>
                      {pkg.description && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "0.75rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(34, 211, 238, 0.15)",
                            color: "var(--accent-cyan)",
                          }}
                        >
                          {pkg.description}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>
                      {pkg.amountLabel}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                      ৳ {cost.toFixed(0)}
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "monospace" }}>
                      ৳ {sell.toFixed(0)}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: profit > 0 ? "var(--accent-lime)" : "var(--accent-magenta)",
                      }}
                    >
                      +৳ {profit.toFixed(0)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: Number(margin) >= 10 ? "rgba(163,230,53,0.15)" : "rgba(245,158,11,0.15)",
                          color: Number(margin) >= 10 ? "var(--accent-lime)" : "#F59E0B",
                        }}
                      >
                        {margin}%
                      </span>
                    </td>
                    <td>
                      {pkg.stock === -1 ? (
                        <span style={{ color: "var(--text-muted)" }}>আনলিমিটেড</span>
                      ) : (
                        <span style={{ fontWeight: 700 }}>{pkg.stock}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${pkg.isActive ? "badge-lime" : "badge-red"}`}>
                        {pkg.isActive ? "সক্রিয়" : "বন্ধ"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Edit style={{ width: "13px", height: "13px" }} />
                          এডিট
                        </button>
                        <button
                          onClick={() => handleDelete(pkg)}
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#EF4444" }}
                        >
                          <Trash2 style={{ width: "13px", height: "13px" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
                {editingPkg ? "প্যাকেজ সম্পাদনা ও রেট পরিবর্তন" : "নতুন প্যাকেজ তৈরি করুন"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {!editingPkg && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    গেম সিলেক্ট করুন *
                  </label>
                  <select
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    required
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    প্যাকেজের নাম *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. 115 Diamonds"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    লেবেল (Amount Label) *
                  </label>
                  <input
                    type="text"
                    value={amountLabel}
                    onChange={(e) => setAmountLabel(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. 115 💎"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--accent-lime)", marginBottom: "4px", fontWeight: 700 }}>
                    বিক্রয়মূল্য (Sell Price ৳ BDT) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace", fontSize: "1rem", fontWeight: 800 }}
                    placeholder="80"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    ক্রয়মূল্য (Cost Price ৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={costBdt}
                    onChange={(e) => setCostBdt(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace" }}
                    placeholder="70"
                  />
                </div>
              </div>

              {/* Profit preview */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                }}
              >
                <span>
                  প্রত্যাশিত লাভ:{" "}
                  <strong style={{ color: "var(--accent-lime)" }}>
                    ৳ {(priceBdt - costBdt).toFixed(0)}
                  </strong>
                </span>
                <span>
                  মার্জিন:{" "}
                  <strong style={{ color: "var(--accent-cyan)" }}>
                    {priceBdt > 0 ? (((priceBdt - costBdt) / priceBdt) * 100).toFixed(1) : 0}%
                  </strong>
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ব্যাজ (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. বেস্টসেলার / সেরা অফার"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ডেলিভারি সময়
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g. ১-৫ মিনিট"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ accentColor: "var(--accent-lime)" }}
                  />
                  সক্রিয় (Active)
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    style={{ accentColor: "var(--accent-cyan)" }}
                  />
                  জনপ্রিয় (Popular)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

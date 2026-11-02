export const metadata = {
  title: "সচরাচর জিজ্ঞাসা (FAQ) | Topup Center",
  description: "গেম টপআপ, পেমেন্ট, ডেলিভারি টাইম এবং রিফান্ড সংক্রান্ত সাধারণ প্রশ্ন ও উত্তর।",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "টপআপ হতে কত সময় লাগে?",
      a: "আমাদের সিস্টেম সম্পূর্ণ অটোমেটেড। পেমেন্ট সম্পন্ন হওয়ার সাধারণত ১ থেকে ৫ মিনিটের মধ্যে আপনার অ্যাকাউন্টে ডায়মন্ড বা ইউসি পৌঁছে যায়। সার্ভার ব্যস্ত থাকলে সর্বোচ্চ ১৫-৩০ মিনিট লাগতে পারে।",
    },
    {
      q: "কিভাবে টাকা পরিশোধ করবো?",
      a: "আমরা বিকাশ, নগদ, রকেট, উপাই এবং ভিসা/মাস্টারকার্ডের মাধ্যমে পেমেন্ট গ্রহণ করি। আপনি সরাসরি পেমেন্ট করতে পারেন অথবা আপনার টপআপ সেন্টার ওয়ালেটে টাকা রিচার্জ করে সেখান থেকে ১-ক্লিকে কিনতে পারেন।",
    },
    {
      q: "ভুল প্লেয়ার আইডি (UID) দিলে কি হবে?",
      a: "অর্ডার দেওয়ার আগে প্লেয়ার আইডি ভালোভাবে চেক করে নিন। ভুল আইডিতে ডায়মন্ড চলে গেলে তা ফেরত আনা সম্ভব নয়। তবে অর্ডার প্রসেসিং শুরুর আগে হলে দ্রুত সাপোর্টে যোগাযোগ করুন।",
    },
    {
      q: "অর্ডার ফেইল বা বাতিল হলে টাকার কি হবে?",
      a: "যদি কোনো কারণে অর্ডার সফল না হয়, সাথে সাথে আপনার সম্পূর্ণ টাকা আপনার টপআপ সেন্টার ওয়ালেটে রিফান্ড জমা হয়ে যাবে। সেই টাকা দিয়ে আপনি পুনরায় অর্ডার করতে পারবেন।",
    },
    {
      q: "ম্যানুয়াল টপআপ কিভাবে কাজ করে?",
      a: "UddoktaPay গেটওয়ে ছাড়াও আপনি আমাদের বিকাশ বা নগদ নম্বরে 'Send Money' করে ট্রানজেকশন আইডি (TrxID) ও স্ক্রিনশট সাবমিট করতে পারেন। আমাদের এআই স্ক্রিনশট থেকে TrxID রিড করতে পারে অথবা অ্যাডমিন ভেরিফাই করে ব্যালেন্স যোগ করে দেবে।",
    },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "12px",
            background: "linear-gradient(135deg, #F8FAFC, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          সচরাচর জিজ্ঞাসা (FAQ)
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          টপআপ সেন্টার ব্যবহারের নিয়মাবলী ও সাধারণ প্রশ্নের উত্তর
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {faqs.map((faq, i) => (
          <div key={i} className="glass-card" style={{ padding: "24px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                marginBottom: "10px",
                display: "flex",
                gap: "10px",
              }}
            >
              <span>❓</span> {faq.q}
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

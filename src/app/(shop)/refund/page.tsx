export const metadata = {
  title: "রিফান্ড পলিসি (Refund Policy) | Topup Center",
  description: "টপআপ সেন্টার রিফান্ড এবং রিটার্ন সংক্রান্ত বিস্তারিত নিয়মাবলী।",
};

export default function RefundPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-magenta)", marginBottom: "20px" }}>
        রিফান্ড পলিসি (Refund Policy)
      </h1>
      <div className="glass-card" style={{ padding: "30px", color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p>গ্রাহক সন্তুষ্টিই আমাদের প্রধান অগ্রাধিকার। রিফান্ড সংক্রান্ত আমাদের সুনির্দিষ্ট নিয়ম নিচে বর্ণিত হলো:</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>১. অটোমেটিক ওয়ালেট রিফান্ড</h3>
        <p>যদি সার্ভার সমস্যা, স্টক আউট বা টেকনিক্যাল ত্রুটির কারণে আপনার অর্ডার ফেইল হয়, তবে সম্পূর্ণ টাকা স্বয়ংক্রিয়ভাবে আপনার 'টপআপ সেন্টার ওয়ালেটে' রিফান্ড ক্রেডিট হয়ে যাবে।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>২. ডিজিটাল গুডস সংক্রান্ত শর্ত</h3>
        <p>যেহেতু গেমের ডায়মন্ড, ইউসি বা ভাউচার কোড একবার ডেলিভারি সম্পন্ন হয়ে গেলে তা ফিরিয়ে নেওয়া যায় না, তাই 'COMPLETED' বা সফলভাবে ডেলিভার হওয়া কোনো অর্ডারে রিফান্ড প্রযোজ্য নয়।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>৩. ভুল প্লেয়ার আইডি সংক্রান্ত শর্ত</h3>
        <p>গ্রাহক যদি নিজের ভুলে ভুল প্লেয়ার আইডি প্রদান করেন এবং সেই আইডিতে ডায়মন্ড ডেলিভারি সম্পন্ন হয়ে যায়, তার জন্য কোনো প্রকার রিফান্ড দেওয়া সম্ভব হবে না।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>৪. রিফান্ডের সময়সীমা</h3>
        <p>ওয়ালেট রিফান্ড ইনস্ট্যান্ট কার্যকর হয়। কোনো বিশেষ ক্ষেত্রে ম্যানুয়াল তদন্ত লাগলে সর্বোচ্চ ২৪-৪৮ ঘণ্টার মধ্যে নিষ্পত্তি করা হয়।</p>
      </div>
    </div>
  );
}

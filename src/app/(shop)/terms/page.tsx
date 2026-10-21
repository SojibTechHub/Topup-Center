export const metadata = {
  title: "শর্তাবলী (Terms of Service) | Topup Center",
  description: "টপআপ সেন্টার ওয়েবসাইট ব্যবহারের সাধারণ নিয়ম ও শর্তাবলী।",
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "20px" }}>
        ব্যবহারের নিয়ম ও শর্তাবলী (Terms of Service)
      </h1>
      <div className="glass-card" style={{ padding: "30px", color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p>টপআপ সেন্টারে আপনাকে স্বাগতম। আমাদের সার্ভিস ব্যবহার করার মাধ্যমে আপনি নিচের শর্তাবলীতে সম্মতি প্রদান করছেন:</p>
        
        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>১. অ্যাকাউন্ট ও নিরাপত্তা</h3>
        <p>ব্যবহারকারীকে তার অ্যাকাউন্টের লগইন তথ্য ও পাসওয়ার্ডের গোপনীয়তা বজায় রাখতে হবে। আপনার অ্যাকাউন্ট থেকে হওয়া সকল কার্যকলাপের দায়ভার আপনার।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>২. প্লেয়ার আইডি প্রদান</h3>
        <p>সঠিক প্লেয়ার আইডি (UID) বা জোন আইডি প্রদান করা সম্পূর্ণ গ্রাহকের দায়িত্ব। ভুল আইডিতে ডায়মন্ড/ইউসি চলে গেলে কোম্পানি রিফান্ড বা পরিবর্তনের জন্য দায়বদ্ধ থাকবে না।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>৩. পেমেন্ট ও ওয়ালেট</h3>
        <p>টপআপ সেন্টার ওয়ালেটে রিচার্জ করা টাকা স্টোর ক্রেডিট হিসেবে বিবেচিত হবে, যা দিয়ে কেবল ওয়েবসাইটে গেম সার্ভিস কেনা যাবে। ওয়ালেট ব্যালেন্স ক্যাশ আউট বা স্থানান্তরযোগ্য নয়।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>৪. প্রতারণা ও নিষেধাজ্ঞা</h3>
        <p>কোনো অবৈধ ট্রানজেকশন, জাল TrxID ব্যবহার বা সিস্টেমের ক্ষতিসাধনের চেষ্টা করা হলে সংশ্লিষ্ট অ্যাকাউন্ট কোনো প্রকার নোটিশ ছাড়াই স্থায়ীভাবে ব্যান করা হবে এবং আইনি ব্যবস্থা গ্রহণ করা হতে পারে।</p>
      </div>
    </div>
  );
}

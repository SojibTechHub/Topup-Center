export const metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy) | Topup Center",
  description: "আমাদের ব্যবহারকারীদের ব্যক্তিগত তথ্যের সুরক্ষা এবং ব্যবহারের নীতি।",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-lime)", marginBottom: "20px" }}>
        গোপনীয়তা নীতি (Privacy Policy)
      </h1>
      <div className="glass-card" style={{ padding: "30px", color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p>টপআপ সেন্টার গ্রাহকদের তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করে। আমরা কীভাবে তথ্য সংগ্রহ এবং ব্যবহার করি তা নিচে তুলে ধরা হলো:</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>১. সংগৃহীত তথ্য</h3>
        <p>রেজিস্ট্রেশনের সময় আপনার নাম, মোবাইল নম্বর এবং ইমেইল সংগ্রহ করা হয়। গেম ডেলিভারির জন্য প্লেয়ার আইডি সংগ্রহ করা হয়।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>২. পেমেন্ট তথ্য</h3>
        <p>আমরা কোনো প্রকার কার্ড নম্বর, পিন বা গোপন পাসওয়ার্ড আমাদের সার্ভারে সংরক্ষণ করি না। সব পেমেন্ট বাংলাদেশ ব্যাংক অনুমোদিত গেটওয়ে (UddoktaPay / bKash / Nagad) এর মাধ্যমে এনক্রিপ্টেড চ্যানেলে প্রসেস হয়।</p>

        <h3 style={{ color: "var(--text-primary)", marginTop: "20px", marginBottom: "8px" }}>৩. তথ্যের ব্যবহার</h3>
        <p>আপনার তথ্য কেবল অর্ডার ডেলিভারি, কাস্টমার সাপোর্ট এবং প্রয়োজনীয় অ্যাকাউন্টিং কাজের জন্য ব্যবহার করা হয়। কোনো তৃতীয় পক্ষের কাছে গ্রাহকের তথ্য বিক্রি করা হয় না।</p>
      </div>
    </div>
  );
}

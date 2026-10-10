# AudiVox — Your Sound. Your Game.

AudiVox হলো একটি আধুনিক মোবাইল গেমিং সাউন্ডবোর্ড প্ল্যাটফর্ম, যার মধ্যে রয়েছে:
1. **AudiVox User Android App** (`android-user/`): নেটিভ অ্যান্ড্রয়েড কোটলিন + জেটপ্যাক কম্পোজ অ্যাপ, ফ্লোটিং বাবল সার্ভিস, মাল্টি-চ্যানেল মিক্সার, লোকাল Room ডাটাবেস এবং সার্ভার অথরিটেটিভ লাইসেন্স যাচাইকরণ।
2. **AudiVox Admin Android App** (`android-admin/`): নেটিভ অ্যান্ড্রয়েড অ্যাডমিন অ্যাপ, মোবাইল ড্যাশবোর্ড, লাইসেন্স জেনারেটর এবং মেইনটেন্যান্স কন্ট্রোল।
3. **AudiVox Admin Website** (Root Web App / `src/`): প্রতিক্রিয়াশীল ডার্ক-থিম গ্লাস-মরফিজম অ্যাডমিন পোর্টাল ও APK বিল্ড এবং রিলিজ কন্ট্রোল সেন্টার।
4. **Supabase Backend Suite** (`supabase/`): PostgreSQL স্কিমা, সিকিউরিটি পলিসি (RLS), আরপিসি ফাংশন এবং এজ ফাংশনস।
5. **Automated CI/CD Workflows** (`.github/workflows/`): GitHub Actions এর মাধ্যমে আসল APK তৈরি এবং রিলিজ ওয়ার্কফ্লো।

---

## 📁 প্রজেক্ট স্ট্রাকচার (Repository Structure)

```
/
├── android-user/                 # নেটিভ অ্যান্ড্রয়েড ইউজার অ্যাপ (Kotlin + Jetpack Compose)
│   ├── app/
│   │   ├── src/main/java/com/audivox/app/
│   │   │   ├── data/             # Models, Room Local DB & SupabaseClient
│   │   │   ├── service/          # FloatingBubbleService, AudioPlaybackManager, UpdateManager
│   │   │   ├── ui/               # Compose Screens (Home, Sounds, Favorites, Mixer, Settings, UpdateDialog)
│   │   │   └── MainActivity.kt
│   │   └── build.gradle.kts
│   └── settings.gradle.kts
│
├── android-admin/                # নেটিভ অ্যান্ড্রয়েড অ্যাডমিন অ্যাপ (Kotlin + Jetpack Compose)
│   ├── app/
│   │   ├── src/main/java/com/audivox/admin/
│   │   │   ├── data/remote/      # AdminRepository (Server RBAC)
│   │   │   ├── ui/screens/       # AdminDashboard, LicenseGenerator, MaintenanceControl
│   │   │   └── AdminMainActivity.kt
│   │   └── build.gradle.kts
│   └── settings.gradle.kts
│
├── supabase/                     # ডাটাবেস ব্যাকএন্ড
│   ├── schema.sql                # সম্পূর্ণ PostgreSQL DDL, RLS ও Stored Procedures
│   ├── seed.sql                  # প্রাথমিক ডেমো ডেটা
│   └── functions/                # Supabase Edge Functions (Deno/TypeScript)
│       ├── register-user/
│       ├── activate-license/
│       ├── validate-license/
│       ├── check-app-policy/
│       └── manage-release/
│
├── .github/workflows/            # স্বয়ংক্রিয় অ্যান্ড্রয়েড APK বিল্ড ওয়ার্কফ্লো
│   ├── build-user-apk.yml        # User APK GitHub Actions Workflow
│   └── build-admin-apk.yml       # Admin APK GitHub Actions Workflow
│
├── src/                          # AudiVox Admin Website (React 19 + Tailwind v4 + Vite)
│   ├── components/               # Dashboard, Users, Licenses, Devices, Releases, Maintenance
│   ├── services/                 # Supabase Real Client Service & Fallback Provider
│   └── App.tsx
│
├── .env.example                  # পরিবেশ পরিবর্তনশীল কনফিগারেশন টেমপ্লেট
└── README.md                     # সম্পূর্ণ ডকুমেন্টেশন
```

---

## 🛠️ ১. Supabase ডাটাবেস সেটআপ নির্দেশিকা (Database Setup)

### Supabase প্রজেক্ট URL:
`https://qbazzarqiplrqqfytajz.supabase.co`

### এক্সেকিউশন অর্ডার (Execution Order):
1. আপনার Supabase ড্যাশবোর্ডে লগইন করুন।
2. বামদিকের সাইডবার থেকে **SQL Editor** এ যান।
3. `supabase/schema.sql` ফাইলের সমস্ত কোড কপি করে পেস্ট করুন এবং **RUN** বাটনে ক্লিক করুন।
   - এটি সমস্ত টেবিল (`profiles`, `licenses`, `devices`, `app_releases`, `audit_logs`), ইনডেক্স, সিকিউরিটি পলিসি (RLS), এবং সার্ভার ফাংশন (`fn_generate_profile_id`, `fn_activate_license`, `fn_check_app_policy`) তৈরি করবে।
4. এরপর ঐচ্ছিক প্রাথমিক ডেটার জন্য `supabase/seed.sql` পেস্ট করে **RUN** করুন।

---

## 🚀 ২. Supabase Edge Functions ডেপ্লয়মেন্ট

আপনার পিসি বা টার্মিনালে Supabase CLI দিয়ে এজ ফাংশন ডেপ্লয় করতে:
```bash
# Supabase লগইন
supabase login

# প্রজেক্ট লিঙ্ক
supabase link --project-ref qbazzarqiplrqqfytajz

# সমস্ত এজ ফাংশন ডেপ্লয়
supabase functions deploy register-user --no-verify-jwt
supabase functions deploy activate-license
supabase functions deploy validate-license
supabase functions deploy check-app-policy
supabase functions deploy manage-release
```

---

## 📱 ৩. অ্যান্ড্রয়েড APK বিল্ড ওয়ার্কফ্লো (GitHub Actions)

যেহেতু ব্রাউজার স্যান্ডবক্স এনভায়রনমেন্টে সরাসরি অ্যান্ড্রয়েড গ্রেডেল এবং NDK/SDK ব্যাকগ্রাউন্ড প্রসেস রান হয় না, তাই একটি প্রোডাকশন গ্রেড স্বয়ংক্রিয় GitHub Actions ওয়ার্কফ্লো অন্তর্ভুক্ত করা হয়েছে।

### কিভাবে আসল APK তৈরি ও ডাউনলোড করবেন:
1. কোডবেসটি আপনার GitHub রিপোজিটরিতে পুশ করুন।
2. GitHub রিপোজিটরির **Settings** -> **Secrets and variables** -> **Actions** এ যান এবং নিচের সিক্রেটগুলো যোগ করুন (ঐচ্ছিক Release Signing এর জন্য):
   - `ANDROID_SIGNING_KEYSTORE_BASE64`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - `ANDROID_KEYSTORE_PASSWORD`
3. GitHub-এর **Actions** ট্যাবে যান।
4. বামপাশ থেকে **Build AudiVox User APK** অথবা **Build AudiVox Admin APK** সিলেক্ট করুন।
5. **Run workflow** বাটনে ক্লিক করুন (Build Type: `release` বা `debug`)।
6. বিল্ড শেষ হলে (সাধারণত ৩-৪ মিনিট সময় নেয়) **Artifacts** সেকশন থেকে সরাসরি আসল `.apk` ফাইল ডাউনলোড করে ফোনে ইনস্টল করুন!

---

## 💻 ৪. Admin Website চালু ও পরিচালনা

Admin Website-টি সরাসরি ব্রাউজারে লাইভ চলছে।
- **লাইসেন্স তৈরি:** দিন, ঘণ্টা, মিনিট ও সেকেন্ড নির্ধারণ করে যেকোন মেয়াদের কি তৈরি করা যায়।
- **ডিভাইস কন্ট্রোল:** যুক্ত ডিভাইসের ফিঙ্গারপ্রিন্ট দেখে প্রয়োজনমতো এক্সেস রিভোক করা যায়।
- **মেইনটেন্যান্স কন্ট্রোল:** এক ক্লিকে সার্ভার মেইনটেন্যান্স অন/অফ এবং কাস্টম নোটিশ পাঠানো যায়।
- **বাধ্যতামূলক আপডেট:** ইউজারদের জন্য নতুন ভার্সন এলে "পরে করবো" এবং "আপডেট করুন" ডায়ালগ পরিচালনা করা যায়।

# Y10 Data Representation Test — Vercel deployment

Mradi huu una:
- `index.html` — mtihani wenyewe (kama ulivyokuwa, pamoja na kuongeza uwasilishaji wa matokeo kwa server)
- `admin.html` — dashibodi ya mwalimu inayoonyesha matokeo ya wanafunzi wote
- `api/submit.js` — inapokea kila matokeo na kuyahifadhi
- `api/results.js` — inatoa matokeo yote kwa admin.html (inalindwa na password)

## Hatua za ku-deploy (mara moja tu)

1. **Weka faili hizi kwenye GitHub repo** (mpya, private ikiwezekana):
   - Unda repo mpya kwenye github.com
   - Pakia (upload) faili zote za folda hii kwenye repo hiyo

2. **Unganisha na Vercel**:
   - Nenda vercel.com → "Add New Project" → chagua repo uliyounda
   - Framework Preset: chagua "Other" (hakuna build command inahitajika)
   - Bofya "Deploy"

3. **Ongeza hifadhi ya bure (Upstash Redis)**:
   - Kwenye dashibodi ya mradi wako Vercel → tab "Storage" → "Create Database" (au "Marketplace")
   - Chagua **Upstash — Redis** (kuna kiwango cha bure/free tier)
   - Bofya "Connect" kwa mradi huu — Vercel itaweka env variables `KV_REST_API_URL` na `KV_REST_API_TOKEN` kiotomatiki

4. **Weka password ya admin**:
   - Project Settings → Environment Variables → ongeza:
     - `ADMIN_PASSWORD` = chagua password yako mwenyewe (mfano: `BedaY10Sept2026`)
   - "Redeploy" mradi baada ya kuongeza variable hii (ili ianze kutumika)

5. **Sasa una link mbili**:
   - `https://jina-la-mradi-wako.vercel.app/` → hii ndiyo link watakayotumia wanafunzi kufanya mtihani
   - `https://jina-la-mradi-wako.vercel.app/admin.html` → hii ndiyo dashibodi yako, itakuomba `ADMIN_PASSWORD` kabla ya kuonyesha matokeo

## Jinsi inavyofanya kazi
- Kila tablet inafungua link ya mtihani moja kwa moja kutoka Vercel (si faili la ndani), hivyo hakuna tatizo la faili tofauti kwenye kila kifaa.
- Timer na majibu bado yanahifadhiwa ndani ya kila tablet (`localStorage`) kama hifadhi ya nakala — hivyo mtihani unaendelea kufanya kazi hata mtandao ukikatika kwa muda.
- Mara mwanafunzi anapo-"Submit Exam", matokeo yanatumwa moja kwa moja kwa `/api/submit`. Ikiwa mtandao haupo wakati huo, matokeo yanasubiri kwenye kifaa na kutumwa kiotomatiki mara mtandao utakaporudi (au ukurasa utakapofunguliwa tena).
- Wewe (mwalimu) unafungua `/admin.html`, unaingiza password, na kuona wote waliofanya mtihani — jina, campus, darasa, alama, %, daraja, idadi ya tab-switches — kwa mpangilio, zenye utafutaji, upangaji (sort) kwa kubofya kichwa cha column, na kitufe cha kupakua CSV kwa Excel.

## Vidokezo vya usalama
- `ADMIN_PASSWORD` ni ulinzi rahisi tu (siyo akaunti ya kila mwalimu) — mwambie yeyote unayemwamini tu.
- Kama utataka watu wa nje wasiweze kufungua `/api/submit` kiholela, unaweza baadaye kuongeza "exam token" ya siri ndani ya link ya mtihani — nijulishe ukihitaji hilo.

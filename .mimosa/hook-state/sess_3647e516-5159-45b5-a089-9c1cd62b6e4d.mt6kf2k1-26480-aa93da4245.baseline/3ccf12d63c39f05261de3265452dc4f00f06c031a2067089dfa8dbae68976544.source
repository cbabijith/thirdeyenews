const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  })
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL not found. Make sure apps/admin-website/.env.local has DATABASE_URL set.')
  process.exit(1)
}

const sql = postgres(connectionString, { prepare: false })

async function seedNews() {
  try {
    console.log('Fetching existing categories...\n')

    const categories = await sql`SELECT id, name, slug FROM categories`
    console.log(`Found ${categories.length} categories:`)
    categories.forEach(c => console.log(`  - ${c.slug}: ${c.name} (${c.id})`))

    // Map user's category labels to existing slugs
    const categoryMap = {
      'Politics': categories.find(c => c.slug === 'politics'),
      'Local News': categories.find(c => c.slug === 'local-news'),
      'Health': categories.find(c => c.slug === 'health'),
      'Cinema': categories.find(c => c.slug === 'cinema'),
      'Business': categories.find(c => c.slug === 'busines'),
      'Crime': categories.find(c => c.slug === 'crime'),
      'Automotive': categories.find(c => c.slug === 'automotive'),
      'Obituary': categories.find(c => c.slug === 'obituary'),
      'Classified': categories.find(c => c.slug === 'classified'),
    }

    // Get admin profile
    const profiles = await sql`SELECT id FROM profiles LIMIT 1`
    const adminId = profiles[0]?.id || null

    const newsArticles = [
      {
        title: 'സംസ്ഥാന വികസന പദ്ധതികൾക്ക് പുതിയ ധനസഹായം പ്രഖ്യാപിച്ച് സർക്കാർ',
        description: 'സംസ്ഥാനത്തെ അടിസ്ഥാന സൗകര്യ വികസനം കൂടുതൽ ശക്തിപ്പെടുത്തുന്നതിനായി സർക്കാർ പുതിയ ധനസഹായ പദ്ധതികൾ പ്രഖ്യാപിച്ചു.',
        content: '<p>സംസ്ഥാനത്തെ അടിസ്ഥാന സൗകര്യ വികസനം കൂടുതൽ ശക്തിപ്പെടുത്തുന്നതിനായി സർക്കാർ പുതിയ ധനസഹായ പദ്ധതികൾ പ്രഖ്യാപിച്ചു. റോഡ് വികസനം, കുടിവെള്ള പദ്ധതികൾ, ആരോഗ്യ മേഖല, വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളുടെ നവീകരണം എന്നിവയ്ക്ക് മുൻഗണന നൽകുമെന്ന് ധനകാര്യ വകുപ്പ് അറിയിച്ചു. വിവിധ ജില്ലകളിൽ നടപ്പാക്കുന്ന പദ്ധതികളുടെ പുരോഗതി വിലയിരുത്തുന്നതിനായി പ്രത്യേക നിരീക്ഷണ സമിതിയും രൂപീകരിച്ചിട്ടുണ്ട്. പുതിയ പദ്ധതികൾ അടുത്ത സാമ്പത്തിക വർഷത്തിനുള്ളിൽ പൂർത്തിയാക്കുകയാണ് ലക്ഷ്യമെന്ന് അധികൃതർ അറിയിച്ചു.</p>',
        category: 'Politics',
        is_published: true,
        view_count: 342,
      },
      {
        title: 'കൊച്ചിയിൽ പുതിയ ബസ് ടെർമിനൽ അടുത്ത മാസം പ്രവർത്തനം ആരംഭിക്കും',
        description: 'കൊച്ചി നഗരത്തിലെ ഗതാഗത സൗകര്യം മെച്ചപ്പെടുത്തുന്നതിന്റെ ഭാഗമായി നിർമ്മിച്ച പുതിയ ബസ് ടെർമിനൽ അടുത്ത മാസം പൊതുജനങ്ങൾക്ക് തുറന്ന് നൽകും.',
        content: '<p>കൊച്ചി നഗരത്തിലെ ഗതാഗത സൗകര്യം മെച്ചപ്പെടുത്തുന്നതിന്റെ ഭാഗമായി നിർമ്മിച്ച പുതിയ ബസ് ടെർമിനൽ അടുത്ത മാസം പൊതുജനങ്ങൾക്ക് തുറന്ന് നൽകും. ആധുനിക സൗകര്യങ്ങളോടുകൂടിയ ടെർമിനലിൽ യാത്രക്കാർക്ക് വിശ്രമമുറി, ഡിജിറ്റൽ വിവരഫലകം, ഭക്ഷണശാല, പാർക്കിംഗ് സൗകര്യം എന്നിവ ഒരുക്കിയിട്ടുണ്ട്. ദിവസേന ആയിരക്കണക്കിന് യാത്രക്കാർക്ക് ഇതിന്റെ പ്രയോജനം ലഭിക്കുമെന്ന് നഗരസഭ അറിയിച്ചു.</p>',
        category: 'Local News',
        is_published: true,
        view_count: 187,
      },
      {
        title: 'മഴക്കാല രോഗങ്ങൾ തടയാൻ ആരോഗ്യവകുപ്പിന്റെ പ്രത്യേക ബോധവത്കരണ ക്യാമ്പ്',
        description: 'മഴക്കാലത്ത് പടരാൻ സാധ്യതയുള്ള പകർച്ചവ്യാധികളെ പ്രതിരോധിക്കുന്നതിനായി ആരോഗ്യവകുപ്പ് സംസ്ഥാനവ്യാപകമായി ബോധവത്കരണ ക്യാമ്പുകൾ ആരംഭിച്ചു.',
        content: '<p>മഴക്കാലത്ത് പടരാൻ സാധ്യതയുള്ള പകർച്ചവ്യാധികളെ പ്രതിരോധിക്കുന്നതിനായി ആരോഗ്യവകുപ്പ് സംസ്ഥാനവ്യാപകമായി ബോധവത്കരണ ക്യാമ്പുകൾ ആരംഭിച്ചു. വീടുകളും പരിസരവും ശുചിയായി സൂക്ഷിക്കണമെന്നും കെട്ടിക്കിടക്കുന്ന വെള്ളം ഒഴിവാക്കണമെന്നും ആരോഗ്യപ്രവർത്തകർ നിർദേശിച്ചു. പനി, ചുമ, ജലദോഷം തുടങ്ങിയ ലക്ഷണങ്ങൾ കണ്ടാൽ ഉടൻ ചികിത്സ തേടണമെന്നും അധികൃതർ അറിയിച്ചു.</p>',
        category: 'Health',
        is_published: true,
        view_count: 95,
      },
      {
        title: 'പ്രമുഖ യുവതാരത്തിന്റെ പുതിയ ചിത്രം റിലീസിന് ഒരുങ്ങുന്നു',
        description: 'പ്രേക്ഷകർ ആകാംക്ഷയോടെ കാത്തിരിക്കുന്ന പ്രമുഖ യുവതാരത്തിന്റെ പുതിയ ചിത്രം അടുത്ത മാസം തിയേറ്ററുകളിൽ എത്തും.',
        content: '<p>പ്രേക്ഷകർ ആകാംക്ഷയോടെ കാത്തിരിക്കുന്ന പ്രമുഖ യുവതാരത്തിന്റെ പുതിയ ചിത്രം അടുത്ത മാസം തിയേറ്ററുകളിൽ എത്തും. കുടുംബപ്രേക്ഷകരെ ലക്ഷ്യമിട്ട് ഒരുക്കുന്ന ചിത്രത്തിൽ നിരവധി പ്രമുഖ താരങ്ങൾ അഭിനയിക്കുന്നുണ്ട്. ചിത്രത്തിന്റെ ഗാനങ്ങളും ട്രെയിലറും ഇതിനോടകം സാമൂഹ്യമാധ്യമങ്ങളിൽ ശ്രദ്ധ നേടിയിട്ടുണ്ട്. റിലീസിനായി ആരാധകർ വലിയ പ്രതീക്ഷയിലാണ്.</p>',
        category: 'Cinema',
        is_published: true,
        view_count: 521,
      },
      {
        title: 'കേരളത്തിലെ സ്റ്റാർട്ടപ്പുകൾക്ക് പുതിയ നിക്ഷേപ പദ്ധതിയുമായി സ്വകാര്യ സ്ഥാപനം',
        description: 'കേരളത്തിലെ നവസംരംഭകരെ പ്രോത്സാഹിപ്പിക്കുന്നതിനായി സ്വകാര്യ നിക്ഷേപ സ്ഥാപനം പുതിയ ഫണ്ട് പ്രഖ്യാപിച്ചു.',
        content: '<p>കേരളത്തിലെ നവസംരംഭകരെ പ്രോത്സാഹിപ്പിക്കുന്നതിനായി സ്വകാര്യ നിക്ഷേപ സ്ഥാപനം പുതിയ ഫണ്ട് പ്രഖ്യാപിച്ചു. സാങ്കേതിക വിദ്യ, ആരോഗ്യരംഗം, കാർഷിക മേഖല, വിദ്യാഭ്യാസം തുടങ്ങിയ മേഖലകളിൽ പ്രവർത്തിക്കുന്ന സ്റ്റാർട്ടപ്പുകൾക്ക് ധനസഹായവും മാർഗനിർദേശവും നൽകുമെന്ന് അധികൃതർ അറിയിച്ചു. അപേക്ഷകൾ അടുത്ത മാസം മുതൽ സ്വീകരിക്കും.</p>',
        category: 'Business',
        is_published: true,
        view_count: 78,
      },
      {
        title: 'ഓൺലൈൻ തട്ടിപ്പ് കേസിൽ മൂന്ന് പേർ അറസ്റ്റിൽ',
        description: 'ഓൺലൈൻ ബാങ്കിംഗ് തട്ടിപ്പിലൂടെ നിരവധി ആളുകളിൽ നിന്ന് പണം തട്ടിയെടുത്തെന്ന കേസിൽ മൂന്ന് പേരെ പോലീസ് അറസ്റ്റ് ചെയ്തു.',
        content: '<p>ഓൺലൈൻ ബാങ്കിംഗ് തട്ടിപ്പിലൂടെ നിരവധി ആളുകളിൽ നിന്ന് പണം തട്ടിയെടുത്തെന്ന കേസിൽ മൂന്ന് പേരെ പോലീസ് അറസ്റ്റ് ചെയ്തു. വ്യാജ സന്ദേശങ്ങളും ഫോൺ കോളുകളും ഉപയോഗിച്ചാണ് പ്രതികൾ തട്ടിപ്പ് നടത്തിയതെന്ന് അന്വേഷണത്തിൽ കണ്ടെത്തി. ഡിജിറ്റൽ ഇടപാടുകൾ നടത്തുമ്പോൾ ജാഗ്രത പാലിക്കണമെന്ന് പോലീസ് മുന്നറിയിപ്പ് നൽകി.</p>',
        category: 'Crime',
        is_published: true,
        view_count: 256,
      },
      {
        title: 'കേരള വിപണിയിൽ പുതിയ ഇലക്ട്രിക് എസ്‌യുവി അവതരിപ്പിച്ചു',
        description: 'പ്രമുഖ വാഹന നിർമ്മാതാക്കൾ കേരള വിപണിയിൽ പുതിയ ഇലക്ട്രിക് എസ്‌യുവി അവതരിപ്പിച്ചു.',
        content: '<p>പ്രമുഖ വാഹന നിർമ്മാതാക്കൾ കേരള വിപണിയിൽ പുതിയ ഇലക്ട്രിക് എസ്‌യുവി അവതരിപ്പിച്ചു. ഒറ്റ ചാർജിൽ 500 കിലോമീറ്റർ വരെ സഞ്ചരിക്കാൻ കഴിയുന്ന വാഹനത്തിൽ അത്യാധുനിക സുരക്ഷാ സംവിധാനങ്ങളും സ്മാർട്ട് കണക്റ്റിവിറ്റി ഫീച്ചറുകളും ഉൾപ്പെടുത്തിയിട്ടുണ്ട്. പരിസ്ഥിതി സൗഹൃദ വാഹനങ്ങൾക്ക് വർധിച്ചുവരുന്ന ആവശ്യകത കണക്കിലെടുത്താണ് പുതിയ മോഡൽ അവതരിപ്പിച്ചതെന്ന് കമ്പനി അറിയിച്ചു.</p>',
        category: 'Automotive',
        is_published: false,
        view_count: 0,
      },
      {
        title: 'പ്രശസ്ത അധ്യാപകനും സാമൂഹിക പ്രവർത്തകനുമായ പി. രാമചന്ദ്രൻ അന്തരിച്ചു',
        description: 'വിദ്യാഭ്യാസ രംഗത്ത് നാല് പതിറ്റാണ്ടിലേറെ സേവനമനുഷ്ഠിച്ചിരുന്ന പ്രശസ്ത അധ്യാപകനും സാമൂഹിക പ്രവർത്തകനുമായ പി. രാമചന്ദ്രൻ (78) അന്തരിച്ചു.',
        content: '<p>വിദ്യാഭ്യാസ രംഗത്ത് നാല് പതിറ്റാണ്ടിലേറെ സേവനമനുഷ്ഠിച്ചിരുന്ന പ്രശസ്ത അധ്യാപകനും സാമൂഹിക പ്രവർത്തകനുമായ പി. രാമചന്ദ്രൻ (78) അന്തരിച്ചു. വിവിധ സാമൂഹിക പ്രവർത്തനങ്ങളിലും സാംസ്കാരിക സംഘടനകളിലും സജീവ സാന്നിധ്യമായിരുന്നു അദ്ദേഹം. സംസ്കാര ചടങ്ങുകൾ നാളെ രാവിലെ സ്വദേശത്ത് നടക്കുമെന്ന് കുടുംബാംഗങ്ങൾ അറിയിച്ചു.</p>',
        category: 'Obituary',
        is_published: true,
        view_count: 43,
      },
      {
        title: 'കൊച്ചിയിൽ ഓഫീസ് അസിസ്റ്റന്റിനെ ആവശ്യമുണ്ട്',
        description: 'കൊച്ചി നഗരത്തിലെ സ്വകാര്യ സ്ഥാപനത്തിലേക്ക് ഓഫീസ് അസിസ്റ്റന്റിനെ ആവശ്യമുണ്ട്.',
        content: '<p>കൊച്ചി നഗരത്തിലെ സ്വകാര്യ സ്ഥാപനത്തിലേക്ക് ഓഫീസ് അസിസ്റ്റന്റിനെ ആവശ്യമുണ്ട്. കമ്പ്യൂട്ടർ പരിജ്ഞാനവും നല്ല ആശയവിനിമയ ശേഷിയും ഉണ്ടായിരിക്കണം. പരിചയമുള്ളവർക്ക് മുൻഗണന. താൽപര്യമുള്ളവർ ബയോഡാറ്റ ഇമെയിൽ മുഖേന അയയ്ക്കുക. ശമ്പളം യോഗ്യതയും പരിചയവും അനുസരിച്ച് നിശ്ചയിക്കും.</p>',
        category: 'Classified',
        is_published: false,
        view_count: 0,
      },
      {
        title: 'തിരുവനന്തപുരത്ത് പൊതുപാർക്ക് നവീകരണ പ്രവർത്തനങ്ങൾ പൂർത്തിയായി',
        description: 'തിരുവനന്തപുരത്തെ പ്രധാന പൊതുപാർക്കിന്റെ നവീകരണ പ്രവർത്തനങ്ങൾ പൂർത്തിയായി.',
        content: '<p>തിരുവനന്തപുരത്തെ പ്രധാന പൊതുപാർക്കിന്റെ നവീകരണ പ്രവർത്തനങ്ങൾ പൂർത്തിയായി. കുട്ടികൾക്കായി പുതിയ കളിസ്ഥലം, നടപ്പാത, അലങ്കാര വിളക്കുകൾ, കുടിവെള്ള സൗകര്യം, വിശ്രമ കേന്ദ്രങ്ങൾ എന്നിവ ഒരുക്കിയിട്ടുണ്ട്. എല്ലാ ദിവസവും രാവിലെ 5 മുതൽ രാത്രി 9 വരെ പൊതുജനങ്ങൾക്ക് പാർക്ക് തുറന്ന് നൽകുമെന്ന് നഗരസഭ അറിയിച്ചു.</p>',
        category: 'Local News',
        is_published: true,
        view_count: 134,
      },
    ]

    console.log(`\nInserting ${newsArticles.length} news articles...\n`)

    let insertedCount = 0
    for (const article of newsArticles) {
      const cat = categoryMap[article.category]
      if (!cat) {
        console.error(`Category not found for: ${article.category}`)
        continue
      }

      // Skip if title already exists
      const existing = await sql`SELECT id FROM news WHERE title = ${article.title} LIMIT 1`
      if (existing.length > 0) {
        console.log(`  ⏭️  Already exists: ${article.title}`)
        continue
      }

      const publishedAt = article.is_published ? new Date() : null

      const [inserted] = await sql`
        INSERT INTO news (title, description, content, category_id, created_by, is_published, is_pinned, published_at, view_count)
        VALUES (${article.title}, ${article.description}, ${article.content}, ${cat.id}, ${adminId}, ${article.is_published}, false, ${publishedAt}, ${article.view_count})
        RETURNING id, title
      `

      console.log(`  ✅ [${article.category}] ${inserted.title} (id: ${inserted.id})`)
    }

    console.log(`\n=== Successfully inserted ${newsArticles.length} news articles ===`)

    await sql.end()
  } catch (error) {
    console.error('Error seeding news:', error)
    await sql.end()
    process.exit(1)
  }
}

seedNews()

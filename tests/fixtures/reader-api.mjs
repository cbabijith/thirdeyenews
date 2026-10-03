import http from 'node:http'
const id = '90f6f7c5-ec93-4196-8c70-b3b90321c47c'
const category = 'b27cb936-eba8-4951-8cbe-8851f0ca4314'
const article = { id, slug: 'sample-story', title: 'പരിശോധന വാർത്ത Test article', content: '<p>Article body appears before recommendations.</p><p>Second paragraph.</p>', is_published: true, published_at: '2026-10-03T10:00:00Z', updated_at: '2026-10-03T11:00:00Z', categories: { name: 'Kerala', slug: 'kerala' }, image_url: null }
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost:3000');const p=url.pathname
 res.setHeader('Content-Type','application/json')
 const send = data => { res.end(JSON.stringify({data})) }
 if(p==='/api/public/categories')return send([{id:category,name:'Kerala',slug:'kerala'}])
 if(p==='/api/public/ads')return send([])
 if(p==='/api/public/sitemap')return send({articles:[article],total:1,categories:[{id:category}]})
 if(p==='/api/public/news')return send([{...article,title:url.searchParams.has('category')?'Filtered Kerala story':article.title}])
 if(p.endsWith('/related')) return setTimeout(()=>send([{...article,id:'related-id',slug:'related-story',title:'Related story',image_url:'https://legacy.example/old.jpg'}]),2200)
 if(p.endsWith('/adjacent')) return setTimeout(()=>send({prev:null,next:null}),2200)
 if(p.endsWith('/view'))return send(null)
 if(p==='/api/public/news/failed-story') {res.statusCode=503;return res.end(JSON.stringify({error:'Temporary outage'}))}
 if(p==='/api/public/news/missing-story') {res.statusCode=404;return res.end(JSON.stringify({error:'Missing story'}))}
 if(p==='/api/public/news/unsafe-json')return send({...article,slug:'unsafe-json',title:'News </script><script>alert(1)</script>'})
 if(p==='/api/public/news/draft-story')return send({...article,is_published:false})
 if(p.startsWith('/api/public/news/'))return send(article)
 res.statusCode=404;res.end('{}')
}).listen(3000,()=>console.log('Fixture backend listening on port 3000'))

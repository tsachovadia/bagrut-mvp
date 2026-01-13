console.log(JSON.stringify(Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')), null, 2))

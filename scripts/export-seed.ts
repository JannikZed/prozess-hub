import { writeFileSync } from 'fs'
import { processes, events, tasks, initialSelectedProcessId } from '../src/lib/mockData'
const payload = { processes, events, tasks, initialSelectedProcessId }
writeFileSync('public/seed.json', JSON.stringify(payload))
console.log('bytes', Buffer.byteLength(JSON.stringify(payload)))

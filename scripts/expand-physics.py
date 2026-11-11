from pathlib import Path
import json,re,unicodedata,collections,gzip,base64,math
ROOT=Path(__file__).resolve().parent.parent
folder=ROOT/'scripts/physics-topics'
baseline=json.loads((folder/'baseline.json').read_text());bank=list(baseline['bank']);counts=collections.Counter(q['topicId'] for q in bank)
def parse_line(topic,line,ordinal):
 if line.startswith('#'):
  m=re.match(r'^(.*?)\|([−-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\|([^|]*)\|(.*)$',line[1:]);assert m,(topic,line)
  t,v,unit,e=m.groups();value=float(v.replace('−','-'));a=f'{value:.8g}'.replace('.',',')+(' '+unit if unit else '')
  d={'value':value,'unit':unit,'e':e,'a':a,'l':'B'}
 else:
  t,a=line.split('|',1);d={'a':a,'e':a,'l':'A'}
 return {'id':f'phys-topic-{topic:02}-{ordinal:03}','kind':'short','topicId':topic,'topic':baseline['topics'][topic-1],'t':t,'o':[],**d,'learningGoal':f'{topic:02}-{ordinal:03}','source':{'file':'Örnek авторлық тақырыптық жаттығуы','basis':'Мектеп физикасы және жіберілген 2026 спецификациясы'}}
allnew=[];extras=[]
for topic in range(1,26):
 lines=[x.strip() for x in (folder/f'{topic:02}.txt').read_text().splitlines() if x.strip()]
 need=100-counts[topic];assert len(lines)>=need,(topic,len(lines),need)
 for i,line in enumerate(lines[:need]):allnew.append(parse_line(topic,line,i+1))
 extras.extend((topic,i+1,s) for i,s in enumerate(lines[need:]))
bank.extend(allnew);assert len(bank)==2500;assert len({q['id'] for q in bank})==2500
for topic in range(1,26):assert sum(q['topicId']==topic for q in bank)==100
# Explicitly declared model-answer exercises avoid fabricated multiple-choice distractors.
# Existing 50 variants and their IDs are untouched, so saved answers remain valid.
data={**baseline,'bank':bank,'schemaVersion':2}
removal_path=ROOT/'scripts/physics-duplicate-removals.json'
if removal_path.exists():
 review=json.loads(removal_path.read_text())
 removed={item['removedId'] for item in review['removals']}
 assert len(removed)==len(review['removals'])
 assert removed<={q['id'] for q in bank}
 assert not removed&{q['id'] for v in baseline['variants'] for q in v['questions']}
 bank=[q for q in bank if q['id'] not in removed]
 assert all(item['keptId'] in {q['id'] for q in bank} for item in review['removals'])
 data={**data,'bank':bank,'deduplication':{'removedCount':len(removed),'reviewFile':'scripts/physics-duplicate-removals.json'}}
raw=json.dumps(data,ensure_ascii=False,separators=(',',':')).encode();encoded=base64.b64encode(gzip.compress(raw,mtime=0)).decode()
(ROOT/'site/physics-data.js').write_text('/* 25 physics topics; reviewed duplicate exercises excluded. */\nlet physicsVariants=[],physicsBank=[],physicsTopics=[];\nconst physicsDataReady=(async()=>{const raw=atob('+json.dumps(encoded)+');const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const data=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text());physicsVariants=data.variants;physicsBank=data.bank;physicsTopics=data.topics;})();\n')
report={'topicCount':25,'itemsPerTopic':100,'bankItems':2500,'retainedItems':len(baseline['bank']),'newItems':len(allnew),'shortAnswerNewItems':len(allnew),'unchangedVariants':50,'retainedVariantQuestions':2000,'counts':[{'topicId':i,'topic':baseline['topics'][i-1],'count':sum(q['topicId']==i for q in bank)} for i in range(1,26)],'semanticReview':'Author-written distinct prompts; numeric-normalized near-duplicate review in physics-near-duplicate-review.json. Reusing physical laws is necessary; changing only numbers is not used as a question-generation method.','sources':['Uploaded A-TOK, 2018 and 2026 physics specification','https://www.nano.gov/about-nanotechnology/what-is-so-special-about-nano/','https://science.nasa.gov/universe/the-big-bang/','https://science.nasa.gov/universe/glossary/','https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/']}
report.update(bankItems=len(bank),itemsPerTopic=None,newItems=sum(q['kind']=='short' for q in bank),shortAnswerNewItems=sum(q['kind']=='short' for q in bank),removedDuplicates=data.get('deduplication',{}).get('removedCount',0),semanticReview='Confirmed repeated tasks removed according to physics-duplicate-removals.json; different physical conditions and unknowns retained.')
(ROOT/'scripts/physics-topic-expansion-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
# Retain the uncompressed bank as a reviewable source, not only an encoded asset.
(folder/'expanded-bank.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print(json.dumps({'bank':len(bank),'removedDuplicates':data.get('deduplication',{}).get('removedCount',0),'assetBytes':len(encoded),'extraCandidates':len(extras)},ensure_ascii=False))

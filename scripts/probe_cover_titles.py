"""Targeted lookups for editorial titles whose names differ from API series names."""
import json,time
from urllib.parse import urlencode
from urllib.request import Request,urlopen
BASE="https://marvel.emreparker.com/v1/search/issues"
queries={
"hulks":["Incredible Hulk","Hulk (1962) #1","The Incredible Hulk"],
"mutants":["New Mutants (1983) #98","New Mutants"],
"gauntlet":["Infinity Gauntlet (1991) #1","Infinity Gauntlet"],
"logan":["Wolverine (2003) #66","Wolverine (2003)"],
"msmarvel":["Ms. Marvel (2014) #1","Ms. Marvel"],
"thor":["Thor: God of Thunder (2012) #1","Thor: God of Thunder"],
"vision":["Vision (2015) #1","Vision (2015)"]
}
for label,terms in queries.items():
    for term in terms:
        url=BASE+"?"+urlencode({"q":term,"limit":200})
        try:
            with urlopen(Request(url,headers={"Accept":"application/json","User-Agent":"MarvelGeeksCoverResearch/1.0"}),timeout=25) as r:
                data=json.load(r)
                items=data.get("items",[])
                picks=[x for x in items if x.get("yearPage") in [1941,1962,1983,1991,2003,2008,2012,2014,2015] or str(x.get("issueNumber")) in ["1","66","98"]]
                print("PROBE",json.dumps({"label":label,"query":term,"count":len(items),"top":picks[:18] or items[:6]},ensure_ascii=False),flush=True)
        except Exception as e:
            print("PROBE_ERROR",label,term,str(e)[:200],flush=True)
        time.sleep(1.2)

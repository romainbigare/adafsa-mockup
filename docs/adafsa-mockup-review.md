# ADAFSA platform — mockup review

**Speakers**

- **Mark** — CEO, Wafra. Gives the comments.
- **Romain** — Director for Digital Systems, Wafra. Built the mockup, walks Mark through it.

Recorded screen-share call, 1h 35m. Working session reviewing (a) Romain's comments deck on the MMC-delivered ADAFSA platform, (b) Romain's own mockup, and (c) the six modules in the proposal, deliverable by deliverable.

**Working version of the proposal is the one dated 20 July** — an older 13 July copy was in circulation during the call and caused a mismatch on the module 6 deliverables.

*Editing note:* this is a working transcript for the engineering team. Small talk, screen-sharing mechanics, document hunting and version-swapping have been removed; everything substantive is kept, lightly cleaned into readable turns. Timestamps mark the start of each turn and index back into `adafsa-mockup-review.raw.txt`, which holds the verbatim segments. Attribution is inferred from content — the recording has no speaker separation. Uncertain terms are listed at the end.

---

## Part 1 — Navigation and information density

**[00:00:06] Romain:** Let's start with the PDF. I've just highlighted a few things, keeping it high level, not too much detail. This is an update — I changed a few things last night. Basically it suffers from the same kind of small organisational issues that the tree monitoring platform suffers from. The navigation, for instance, is still quite cumbersome. More than half of these navigation buttons are about support, and I think usually you'd expect that to be just one button leading you to another support page — the button wouldn't be the central part of the app. There are still maybe some questions around violations, and I think the latest agreement with ADAFSA was that we were not going to track violations, so I think this has to go as well.

**[00:01:18] Mark:** Can I make a suggestion? You're raising a lot of issues. Do you think it's more effective with MMC to give them advice? So for example, they say half the menu is about support — is it more effective for you to say, take these three and merge them into one button?

**[00:01:37] Romain:** I have that for monitoring — it's on the next slide. This is maybe for us to discuss, and we can remove that for MMC if you want.

**[00:01:49] Mark:** That's a good idea.

**[00:01:52] Romain:** The last problem as well is that obviously the six modules we've agreed with the devs aren't necessarily very visible from the navigation. The second main issue is that, just like with the tree monitoring, the density of information is quite low. You have a pretty big page with rectangles that take up quite a lot of space and don't give you much. This map, for instance, takes half the screen but doesn't really show you much, and the legend speaks for itself — the only thing you see is "farm boundary". Whereas if the client has agreed to these modules, they might want to know where we're having problems with irrigation efficiency. So on the map, instead of just having farm boundary, the map is very useful to answer questions like: do we have areas that suffer from irrigation inefficiency much more than other areas? Do we have areas where the estimated crop yield is going to be lower than others? This map can be a very powerful tool, but it's not being used at the moment. So the question is, can we make it speak a little bit more?

**[00:03:16] Mark:** So we have the irrigation efficiency rating. You're proposing a way to screen these farms based on the irrigation efficiency — colour-code them, or filter them: top category, second category, bottom category.

**[00:03:36] Romain:** Yes, I'll show that in the suggestions.

**[00:03:53] Mark:** What's missing, I thought, is numbers. So for example in a particular location like Al Ain, it's like Google Maps: you have a number that says 65, 65 farms there. As you zoom in it breaks down into further categories.

**[00:04:04] Romain:** Yes, it's on another page, it's not in the main one. I agree it should be — that's part of the suggestions.

**[00:04:27] Romain:** As suggestions, what I'm proposing is two steps. Very simple, but I think powerful. The first one is just a much better use of the navigation pane. We have probably three levels of detail of data, three levels of intensity of data. The first one should just be an overview page outlining the current situation in the region based on the high-level metrics of the modules. The second level would be the modules themselves. And then, on a farm-by-farm analysis, a drill-down in detail. So that to me could be the three levels of detail, and it could look like that on the navigation pane.

**[00:05:26] Mark:** If I'm ADAFSA, what's the first page I see?

**[00:05:30] Romain:** Overview.

**[00:05:30] Mark:** What do you mean by overview? A page with all the key functions?

**[00:05:36] Romain:** Yes, I've made a mockup as well so I can show that.

**[00:05:43] Mark:** I'll wait for that. The modules — can we go up on the modules? So we have crop monitoring, and just for consistency, palms and fruit trees, that's also monitoring. I think just put field crops for the first one, field crops. Second one is palms and fruit trees. Third one — you're saying keep land use and structures together?

**[00:06:22] Romain:** To keep it streamlined I followed the modules, because we have such strong clear targets for ADAFSA. The question is, can we just split the navigation into these six modules? Obviously the three last ones are the really interesting ones — they're the ones having an impact on the farming process. So we might just want to have those three, and then a monitoring module where we combine the other three.

**[00:06:59] Mark:** And again, we're looking at ADAFSA here, so I can see how ADAFSA would be different from a commercial client, because ADAFSA doesn't actually want to monitor crop health for a particular farm, but the Azerbaijan client would. Irrigation efficiency, great. Just conceptually — irrigation efficiency is to show the farms. You're able to display the farms and have a table based on efficiency levels? The bottom 10?

**[00:07:30] Romain:** Yes.

**[00:07:32] Mark:** Land use and structures — again, I have the maps, I have reports and I can do some screening. So I can get a breakdown by tier 1, tier 2 or tier 3. You're aware of the three tiers for structures?

**[00:07:48] Romain:** I am, yeah.

**[00:07:51] Mark:** So that allows me to understand — the two are kind of tied together, so land use will give me the distribution between field crops, fruit trees, structures. And crop monitoring — how would you describe it? I like the word "monitor", but it's not monitoring so much, it's classification more than anything.

**[00:08:22] Romain:** Yes, so it's field crops.

**[00:08:25] Mark:** So what you're saying is field crops plus trees plus structures plus X is your land use. I'm wondering if mixing land use and structures is too much.

**[00:08:41] Romain:** We could probably — I think logically the first one would be land use.

**[00:08:47] Mark:** Because this is not an agricultural perspective, it's more of a monitoring perspective, it's not a production perspective. So what I'm asking is: land use, then field crops, palm trees and fruit trees, structures — as the first four? Or is that too many? Feel free to disagree.

**[00:09:08] Romain:** No, I think it's good. These ones just followed the modules as they were agreed in the documents, but if we want to split land use and put it at the very top, I think that's fine. I don't think land use is in the proposal, is it, for ADAFSA? The classification accuracy of land use — I'll need to double-check. Let's go back to the proposal. So what we have — we have seasonal crop monitoring, so it's called crop monitoring. Date palm and fruit tree monitoring.

**[00:10:29] Mark:** But your challenge is you're trying to keep them to simple words. So: module, tree monitoring.

**[00:10:40] Romain:** So crop monitoring and tree monitoring, then.

**[00:10:43] Mark:** That sounds good.

**[00:10:46] Romain:** And you're right, the module doesn't include land use in the title, it's only structures. That's my bad, I'll remove that. So that means we can have land use separately.

**[00:11:00] Mark:** Keep land use, because we've committed to doing the land use analysis. Have land use as the first one, or not? No, I think so. It's a good idea. But that's not the priority, is it? I'm coming around to what you have. So you have crop monitoring — agree. Next one is tree monitoring. Then land use and structures. I think it's very efficient. I don't disagree with you, I can see how that goes together.

**[00:11:36] Romain:** Okay, because I don't think we'd want to make it too complicated. Then we have irrigation efficiency.

**[00:11:41] Mark:** Okay, and I'm with you.

**[00:11:43] Romain:** Then we have yield forecast.

**[00:11:46] Mark:** Can we, just for marketing purposes, call this yield optimisation? That's ultimately what we want it to be.

**[00:11:52] Romain:** It's a good idea. And then water allocation — it's also kind of optimisation in a way.

**[00:12:22] Mark:** I was worried — doesn't water allocation and irrigation efficiency actually come together as one?

**[00:12:28] Romain:** They obviously overlap, but they've been kept separate in the modules, in the contract with ADAFSA.

**[00:12:38] Mark:** I wouldn't worry too much about the modules, in the sense that that's more contractual. Let's present this the way we think is right. Let's combine them.

**[00:12:45] Romain:** I agree. Personally I got even a little bit confused during the navigation pane, thinking these sound very, very similar. And both are useful.

**[00:13:08] Mark:** Water allocation — the word. What are we calling it?

**[00:13:21] Romain:** In the quote we're calling it crop water allocation calculator.

**[00:13:25] Mark:** Call it the irrigation calculator. I think they would recognise that.

**[00:13:29] Romain:** That sounds good. But you see how this navigation pane is really drilling down into three levels — that's the main idea. We want a general situation overview, then we want to drill down by modules, still on an area as a whole, and then we want to drill down on a farm as the last step in the process.

**[00:13:59] Mark:** Now that I've seen things, I completely agree with what you're doing. Just to agree: we have crop monitoring, tree monitoring, land use and structures — no change. Irrigation efficiency — no change, move up. Water allocation — what do we call it in the proposal?

**[00:14:28] Romain:** We called it water allocation calculator.

**[00:14:36] Mark:** Can you put crop water calculator? Or is it not enough words?

**[00:14:41] Romain:** I think it's fine. Crop water calculator.

**[00:14:48] Mark:** Do that, and then move it up. And for yield, call it yield optimisation and move it last.

**[00:14:54] Romain:** Yield optimisation goes last, water allocation becomes crop water calculator, and irrigation efficiency stays the same.

**[00:15:06] Mark:** I like the order you have. Land use and structures is static — it's just an inventory, so they belong together. Irrigation efficiency, crop water allocator — "allocate" is a bit of a strange word. Crop water calculator. Think of a word that to a non-English speaker makes sense.

**[00:15:39] Romain:** Crop water calculator sounds pretty good, and then yield optimisation.

**[00:15:49] Mark:** Good, great.

> **Agreed navigation order:** overview → crop monitoring → tree monitoring → land use and structures → irrigation efficiency → crop water calculator → yield optimisation → individual farms. Violations and flood-irrigation detection are removed. Support collapses to a single button.

## Part 2 — Three layouts, and the overview page: map versus numbers

**[00:15:51] Romain:** So that's the navigation pane, step one. Step two for me is another easy step: just using a layout for each part. If we have three levels — level one, level two with the modules, and level three with the drill-down analysis — I think we should just have three simple layouts. It doesn't change much from the ones they have, but it condenses the information a bit more. So for the overview page we could make better use of the map.

**[00:16:47] Mark:** You showed me something that triggered a thought. You have "farm analysis". Help me understand: if I want to analyse tomato producers, do I click on crop monitoring or click on farm analysis?

**[00:17:01] Romain:** So analysis is at the individual farm level, whereas these modules are at the region level. But you can get from the modules to the farm analysis through the page — it's not necessarily through the navigation system, but it helps.

**[00:17:24] Mark:** That's fine. One thought. In discussion with someone from ADAFSA — because they're broken down into three provinces, and there are members of the royal family that run each province, sometimes they'd like the results for Al Ain, or the results for Al Dhafra. So just keep in mind that on the regional analysis we should, wherever appropriate, be able to look at the Abu Dhabi Emirate but also Abu Dhabi province, Al Dhafra province. They sometimes need that data filtering. Farm analysis — that's individual farms, right?

**[00:18:00] Romain:** Individual farms.

**[00:18:02] Mark:** We could add that into the name. Remove "analysis" and just call it "individual farms".

**[00:18:07] Romain:** Okay, that's good.

**[00:18:09] Mark:** So I'm the inspector, I'm going to visit my five farms. I go here, click on that one farm, I get the profile, the list of issues, I know exactly what's going on.

**[00:18:19] Romain:** Exactly. You have the farm outline and some data around how well the farm is doing on the different modules.

**[00:18:33] Mark:** When I spoke to the field inspectors, they have a tablet-based questionnaire. They go to the farm, they have to answer a number of questions, and then there's an AI that produces a report — it doesn't do anything else than just take a lot of comments and make a nice report they send to the farmer. At some point they'll probably want to take the farm analysis and feed it into the tablet. There might be a later improvement that we'll do, so keep that in mind. And in "individual farms" — do we go straight to individual farms, or is there a menu above that that's by region?

**[00:19:26] Romain:** That could be a good idea. Let me see how I can integrate that.

**[00:19:32] Mark:** Or is that just in the reporting?

**[00:19:37] Romain:** I was thinking the filtering by region could be done on the page itself. So if we open a module — say irrigation efficiency — we look at the map of all the areas and the scores, and we can automatically filter it down through the province, through a drop-down or something like that.

**[00:19:58] Mark:** Agreed.

**[00:20:03] Romain:** So the idea is we use three different layouts for the three different levels of detail. The individual farm will have its own layout, the module pages will have their own layout, and the overview page will have its own. But the idea is that we condense information a bit more, and we could use the map a bit more to answer the issues we've highlighted. Slide two — what it could look like in practice, a screenshot from the mockup. We have an actual view on the six modules; at the bottom we have a map showing the hotspots of good overall health, bad overall health. So we can bring up the information in a lot more obvious ways using the map and simple charts at the bottom. If you compare this with, say, this — you can immediately see a lot more information. That's what I mean by densifying the information.

**[00:21:27] Mark:** I just want to challenge you on something — for the sake of discussion. Why have a map here? What you're showing here, I find the map hard to read. With the intro page, I like the six modules, but it's more of a table — it's the six modules with the key information you need. So for example, crop monitoring: you tell me it's 25,000 farms, of which 3,000 good health, 2,000 needing attention, 1,000 or something. Maybe it's a view on crops on this page. Is this really the place to put the map? Because for crop monitoring, maybe what I'd like to see here as a summary is what's growing right now.

**[00:22:17] Romain:** That's true.

**[00:22:19] Mark:** If you vaguely remember the presentation I prepared from the pilot, we had a table that said today there are so many dunums, X percent for this, X percent for that. To me this is what I'd like to see here. That's the data I need, because the map doesn't do much. So for example, for farms, first you tell me the top 20 crops are listed. Same thing for trees. So that is an inventory. The second one is maybe distribution of health score, if we're doing tree health monitoring.

**[00:22:59] Romain:** Okay, so two things: tree distribution, next thing is tree health score.

**[00:23:04] Mark:** And is it up or down from last week?

**[00:23:07] Romain:** I'm concerned about doing week-to-week comparison. It should be more like a rolling four weeks.

**[00:23:12] Mark:** Rolling four weeks. You think statistically four weeks is good?

**[00:23:15] Romain:** Four weeks is good. Week to week is too small a change.

**[00:23:29] Romain:** So we're moving from the graphic map to a more metric-based, numbers-based approach on this page.

**[00:23:38] Mark:** I think so. For crop monitoring, first I want to know what crops are growing. And I have a taxonomy I can send to you. So typically we want cereals — that's part of it.

**[00:23:53] Romain:** Let me show you the actual mockup. One of the issues I've detected with the old way is the taxonomy doesn't filter any of the results, whereas what you want to do is use the taxonomy as an actual filter for the data below it.

**[00:24:28] Mark:** So show me — 59 means it's 59 farms?

**[00:24:34] Romain:** Yes, in that zone.

**[00:24:36] Mark:** Is there any way to put some borders and streets back on, or does that destroy it?

**[00:24:42] Romain:** No, of course we can.

**[00:24:47] Mark:** Major ones — just major highways.

**[00:24:51] Romain:** I didn't add any control buttons for the maps. Usually you'd have buttons where you can select different types of maps — that's very easy to add, I just didn't put it in the mockup.

**[00:25:25] Mark:** So I'm seeing the 17s — this is Madinat Zayed, so the 17 farms. But if I were to delete date palm, fodder, fruit trees and open field, then that number goes from 17 to 5, if there are only five farms.

**[00:25:50] Romain:** Yes. And it's coloured by the current overall health of these plots.

**[00:25:59] Mark:** Is that too much information — the health? What you're doing there maybe belongs elsewhere, on the home page. I'm just looking for inventory.

**[00:26:11] Romain:** Yes, so I think that's what we're getting to — this is maybe more suited to the different modules, and then this page, the overview, will be more of an inventory: tables with numbers and charts showing what we have.

**[00:26:31] Mark:** So we keep the map, forget about the colours. It just shows the basic categories, how many cereal farms and so on. And then below that we have crop — if I scroll down, then on crop I get the exact number of dunums and farms for each crop.

**[00:26:51] Romain:** Sounds good, we're doing that.

**[00:26:54] Mark:** So the first might be crop distribution by dunum, next one is crop distribution by farms. Let me show you what I presented to ADAFSA and they seemed to acknowledge that — the field survey. At some point we need to show this information somewhere. It could be on the land use page, that's fine, but we like these numbers somewhere — we should show this breakdown.

**[00:28:10] Romain:** And it's by dunum with percent, by farm with percent.

**[00:28:16] Mark:** Yes. And I think this needs to be organised a bit differently, so you might have three major categories. Go to MapMyCrop's taxonomy — major classifications. So we have cereal, fodder, and then field crops, vegetables, cucurbits — it's too many categories.

**[00:29:20] Romain:** Yeah, we've combined them, I remember that.

**[00:29:23] Mark:** So we're calling all of these field crops?

**[00:29:26] Romain:** Yes. So it's cereal, fodder, field crops. That's the taxonomy I've used for that mockup.

**[00:29:32] Mark:** Perfect. And where we have dual names, you can just pick the first name — so pick "eggplant" and simplify. And for trees, same thing. I think we could use this taxonomy. Forget about coffee — coffee is Saudi Arabia. But we've got dates, date trees, possibly by cultivar, citrus.

**[00:29:57] Romain:** No, I think for trees it's date palm and fruit trees, and fruit trees is one big category. So I have two categories: date palm, and fruit trees containing all of the fruit trees.

**[00:30:11] Mark:** Perfect. Forest trees — maybe somewhere you might stick that in, since we're looking at it.

**[00:30:19] Romain:** Sounds good, forest trees, let's do that. I might add that to trees, actually. So maybe it's date palms, fruit trees and forest trees. I'll add the category.

**[00:30:30] Mark:** And then structures. The big boxes here is tier two, which we're going to do for the October rollout, and then tier three, the grey boxes — that's going to require a bit of investigation, because we're not sure how to distinguish a fertigation unit from a filtration unit. I don't think it's possible. So irrigation utilities is detected by the satellite based on the analysis — pump room versus desalination versus filtration. That's determined more situationally: if X is next to Y and X to Z, then we know it's a desalination unit. I don't think they can do it personally, but we'll see.

**[00:31:12] Romain:** I'm surprised they can. The problem is desalination and filtration are the same thing. Pump, desalination, filtration — they're all together basically. You have a pump taking the water out, you might have some sort of long tube with a filter to filter the water, and then it goes into a water tank. So it's attached to a water tank. I have no idea how we distinguish pump room, desalination unit, filtration unit, because all those are covered and typically next to a water tank. It's a very surprising granularity of detection. I think they made a mistake, but I'll see.

## Part 3 — The overview page: inventory, not health

**[00:32:13] Mark:** So here we're going to add the boundaries for the country, the emirates and the provinces, and the major roads. And you have buttons on the right. And on the left you're just giving me numbers, not giving me any qualification on the map — it's just numbers.

**[00:32:33] Romain:** Yeah, no colours, no legend.

**[00:32:36] Mark:** And if I click on cereal, where do I get the total number of cereal farms?

**[00:32:45] Romain:** There is here at the top — basic metrics.

**[00:32:53] Mark:** Yeah, but if it's cereal you give me a whole lot of numbers. You say there are three cereal farms here, cereal farms there, eight there. So where do I get the total number of cereal farms?

**[00:33:03] Romain:** So basically this being the overview, it keeps it relatively light. If we now want to move to each module, let's say we want to see how many cereal farms — we can then go into crop monitoring, and this gives you the table filtered by your latest pick.

**[00:33:26] Mark:** This number four tells me what — the number of farms?

**[00:33:34] Romain:** Yes.

**[00:33:35] Mark:** So this map shows me the number of farms based on the criteria you use on the left. So if I click on cereal and delete everything, I've got one bubble with four, one bubble with three, one bubble with six.

**[00:33:45] Romain:** Yes.

**[00:33:47] Mark:** Where's the total number for Abu Dhabi? Instead of my having to count every box — what if I just want to say, what's the total number of farms doing cereals?

**[00:34:03] Romain:** It's here at the very top. What I'm getting from this conversation, though, is that it might be more helpful to have slightly bigger charts showing the overall numbers, because these ones might not be easy to detect.

**[00:34:30] Mark:** So in overview — that tells me where the farms are and what they're doing, right? And how do I know how many cereal farms there are and where they are? I click on cereal, delete everything else, I have a bunch of numbers. I think I would also want to know the total.

**[00:34:55] Romain:** Yes, so total farms is here, and then if you click on cereal it gets updated.

**[00:35:05] Mark:** So when I click on cereal, that number appears here.

**[00:35:12] Romain:** Yes, everything is responsive and it reacts to the filtering that's been chosen.

**[00:35:20] Mark:** Other question. So instead of overall health, this is purely an inventory. Good. At this level it's purely inventory.

**[00:35:28] Romain:** We'll change that.

**[00:35:31] Mark:** Because I think as a ministry or an agency, they want to track production capacity, not necessarily health. Health comes under farm-level analytics.

**[00:35:44] Romain:** It's a very good point, and it also solves an issue — I was trying to explain in the PowerPoint how to calculate an overall health metric based on all the other metrics, but that's not something MMC does. So actually moving away from that is probably better.

**[00:36:01] Mark:** So the top box is how many cereal farms there are, how many dunums and how many farms.

**[00:36:13] Romain:** Yes, and we'll make these numbers a bit bigger.

**[00:36:17] Mark:** Why did you put 08:42? What's that?

**[00:36:21] Romain:** That's the last AI scan, or last satellite scan. It doesn't have to be there. It's the idea that it's real time and we can show a time — but I suppose it would be more of a date than a time in real life.

**[00:36:36] Mark:** We have room for four pieces of data. One is number of farms, one is number of dunums.

**[00:36:47] Romain:** Count and dunums.

**[00:36:52] Mark:** Is that the geographic menu? I can have Emirate of Abu Dhabi, Abu Dhabi province — so the guy who's responsible for Al Dhafra gets the numbers for Al Dhafra.

**[00:37:06] Romain:** Yes, there's a menu there, you can either click the full Abu Dhabi or select one of the three provinces.

**[00:37:12] Mark:** And below that — go down a bit. So you have barley, quinoa, wheat. Out of curiosity, these three cereals are showing up because there's nothing else?

**[00:37:23] Romain:** It only shows what's exactly there.

**[00:37:37] Mark:** So just redo the order: cereals, fodder, open field, and then all the trees — date palm, fruit, and forest last. And remove the dash from "open field".

**[00:38:02] Romain:** Sounds good.

**[00:38:04] Mark:** And what about fallow land?

**[00:38:07] Romain:** That shows up on the land use.

**[00:38:09] Mark:** Good. At the bottom, if I scroll down under crop monitoring, I'll have the tables that show me the count by my crop category and my crop. Some counting by farm.

**[00:38:34] Romain:** So whatever you click on here brings you to the module in the map.

**[00:38:42] Mark:** The thing at the bottom under crop monitoring, the lower left, that shows everything. I don't think you do any selection there.

**[00:38:46] Romain:** I think it does. These interact with the filtering. If you only click cereals, you can see the numbers with cereals.

**[00:39:02] Mark:** So what I'm suggesting on the crop monitoring is, I get a table that shows me for all the… My thought is: the map is interactive, the tables below are fixed. And the question is, could we show the tables that I had — that say crops, three crops, how many dunums, percentage; different types of fodder, how many dunums, percentage — and then the same table below that with the farms?

**[00:39:30] Romain:** So in my mind that would go into the crop monitoring module.

**[00:39:41] Mark:** There's no summary. There's no summary table here.

**[00:39:46] Romain:** So this is the summary, basic information.

**[00:39:52] Mark:** For example, what happens is — tomato season is starting, someone very quickly wants to know how many farmers are growing tomatoes this year and what's the size. You go to the home page for that. You don't want the guy to go and do a search.

**[00:40:04] Romain:** It doesn't show up anywhere else, you're right.

**[00:40:08] Mark:** Because those tables I showed them, they like them. That is the summation.

**[00:40:12] Romain:** You're right. I think I've stripped down the overview page a little too much. I've got a clear picture now of what the overview page should look like.

**[00:40:25] Mark:** So I scroll down. I first have farms. It's a cereal total, then the breakdown of cereal total. I don't know how you want to show it, but I think it'd be fairly extensive, and it has the numbers. Or maybe it's interactive — so the thing below has cereals, fodder, trees, produce, whatever. It gives me the dunums, it gives you the number of farms. If I click on it, it further breaks down farms doing cereal, farms doing wheat, farms doing whatever. And then I have the same replicated for dunums as opposed to farms. Does that make sense?

**[00:41:06] Romain:** It makes perfect sense. But the searching functions are at the top — below is statistics for everything.

**[00:41:16] Mark:** If they just want to know wheat, it's included in that table below. You click on cereals and you get the cereal total, or you click on cereals and you get the wheat total — dunums and farms. I think it needs to be down there. People will want to see that data.

**[00:41:37] Romain:** Totally agree, that makes more sense. And then if people want to see other things, it's easy to add them at the bottom, so you can keep on scrolling. If we say at some point we want to add irrigation efficiency rating on the home page, we can add it at the bottom.

**[00:41:50] Mark:** We're not there yet.

**[00:41:53] Romain:** No, I agree. My focus was on: can we use that page to show the overall health of all the farms? But you're right, it's not necessarily what the government is going to want to see on that overview page. They want the stock metrics. So it's just a change in my mindset on that page.

**[00:42:15] Mark:** Now, if you want to get clever — the other thing they want to know is production. So you've told them how many farms are growing tomatoes, what dunums. The next table they'd like to see is the crop production.

**[00:42:36] Romain:** That's for a later enhancement at some point. And because it's seasonal it's a bit hard — are you measuring last three months, last six months?

**[00:42:47] Mark:** That we'll discuss with them, but that's a future enhancement. And the crop health is an individual farm issue, concerns the local teams.

**[00:43:02] Romain:** I agree. That's a good reframe. So that's the overview page, which will change to more of a stock monitoring and overall metrics.

> **Overview page — decision:** it is an **inventory/production-capacity page, not a health page.** Top metrics: farm count and dunums, plus a province selector (Abu Dhabi Emirate / Abu Dhabi / Al Ain / Al Dhafra). Map keeps bubbles with counts, drops health colouring, gains country/emirate/province boundaries, major highways and map-type controls. Below the map, fixed summary tables — crop distribution by dunum and by farm, with percentages, expandable from category down to individual crop. Left-hand taxonomy filters everything on the page. Crop production is a later enhancement; health moves to the farm level.

## Part 4 — Module pages, sub-pages and change detection

**[00:43:21] Romain:** Here, based on the comments we just had for the overview page, there are quite a few changes I want to do as well. The idea here was to have a list of data based on their status — cultivated, fallow and so on — but that's still very much health-related, or state-related, whereas you want to see quantities. So this will change as well. And it's the same for palm and fruit trees, where it was all basically based on health. So I'll reframe that so it focuses on metrics and quantities. And everywhere we have this map, but the map occupies space.

**[00:44:24] Mark:** Again, I think the idea was the map is a map at the bottom—

**[00:44:29] Romain:** No, the map will have to change, because if you're talking about health it's obviously really good to have a map and see where the hotspots of problems are. But if we're talking about metrics and quantities, the map doesn't really help being that big. It takes too much space and doesn't leave enough space for actual data and charts and metrics.

**[00:44:55] Mark:** So crops — here's what we committed: cultivated area, seasonal change, fallow land detection. So those are the three things you need to show there, and it has to be a searchable table.

**[00:45:07] Romain:** I agree. So the map summary will change, the data set will change.

**[00:45:11] Mark:** So if you go back to the proposal, it's crop location, crop type classification. I'm not saying no to the map, but we just need to make sure that it's easy for me to search those.

**[00:45:29] Romain:** I think it needs to change, it takes too much space. For quantities it's not that useful. We can keep it, but it will take up less space.

**[00:45:38] Mark:** So for example, cultivated area will be reported per farm and per crop type, with the ability to map quarterly crop changes. So if there's a map, it's more at the farm level. "Flag new and abandoned cultivation against UAE seasonal baseline." So these are complicated modules.

**[00:46:19] Romain:** So this one is basically a way for them to see whether there's been an increase in activity or a decrease in activity. So if you're expecting certain farms to grow tomatoes in November, do we have additional tomato crops or fewer tomato crops? This was on a farm-by-farm basis — that's the individual farm analysis — but I think moving that up to the module page would be good as well.

**[00:47:02] Mark:** So this one in particular — the seasonal change report — it feels like when I click on the module marked crop monitoring, is there a sub-menu called seasonal change report?

**[00:47:31] Romain:** That could be good. And this is maybe going in the direction we took with the tree monitoring comments, which was to actually use the modules as broad categories, but then you can navigate to sub-pages.

**[00:47:47] Mark:** Yeah, because "seasonal change report" — I basically want to know at the emirate level, at the provincial level, and then maybe farm level. I'm assuming it's who's growing tomatoes, what has increased, what has decreased from last year. And you can get consolidated numbers, or you can say give me the list of farms that have stopped growing tomatoes and grew them before.

**[00:48:20] Romain:** So it's individual farms, it's almost like a searchable database for individual farms.

**[00:48:27] Mark:** It's like, give me all the farms that — and then you decide: I'm growing tomatoes, or I used to grow tomatoes but I'm not doing it any more, or I'm doing it now but didn't do it in the past, or have increased, or have decreased.

**[00:48:38] Romain:** That makes sense.

**[00:48:41] Mark:** Cultivated area is by farm and by crop type, right? So again, we have a list of all farms. On that page I see the list of 25,000 farms, I click on one farm and there's a breakdown for that farm. And then I can do a search — farmers have increased or decreased their cultivation area. Crop location and crop classification, that's the map, maybe your map. So crop location, crop classification is the first sub-page, with a map if you want. We also need numbers — the cultivated area. Or do we mix crop location, crop classification, cultivated area? Do we do that in one sub-page or three sub-pages? I'm not sure.

**[00:49:56] Romain:** I'll have to think about how it all fits together.

**[00:50:16] Mark:** Because I think for crop type classification, you want summary reports at the emirate and provincial level, and cultivated areas maybe at the farm level. So maybe those three on the same page. And so for each farm — I'm going to click on farm 234, I know I have their statistics showing up. Fallow detection, I think, is on a separate page, and that just gives you the statistics for fallow land. It may be a very simple table, but you're able to see at the emirate level where it is today, changes from last year, and then the individual data for each farm — how much fallow land they have. And then the ability to search that.

**[00:51:04] Romain:** So what I'm hearing is maybe a more fully fledged module group. For each module it's a group of pages, and you'll have by region, by farm, that have fallow lands, locations of crops and so on. So it's a much bigger navigation pane grouped by modules.

**[00:51:34] Mark:** I think so. That sounds pretty good. So to avoid you having to put in a ton of work, how can you put a draft together for us to review? It's not labour-intensive for you, because we're still at the discussion phase.

**[00:52:01] Romain:** The feedback here is really helpful, because at this level it's determining what the mindset of each page is. As we've seen with the overview, a change in focus changes completely the way you approach the page. The quickest thing for me is to change the mockup, and we discuss the mockup rather than discussing a separate document. So I can tweak the navigation pane in the mockup, build a very quick, dirty draft layout of what each page is going to show, and then we can review that again. And if that's helpful, I can also generate a PowerPoint from it, just like we did with the Wafra farm app.

**[00:52:59] Mark:** If it's not too much work. My worry is we still don't mention the design phase, and I don't want you to feel frustrated that you're repeating things.

**[00:53:08] Romain:** No frustration at all. The PowerPoint is generated automatically from the mockup, so it's not work that I need to do myself. I update the mockup and then I generate the PowerPoint from that mockup. That's how we're doing it for the farm app.

**[00:53:30] Mark:** Then look at the deliverables for the trees. Tree location, tree count, species, variety.

**[00:53:44] Romain:** One thing I forgot — we have percentages here, accuracy measurement. Do we need those?

**[00:53:56] Mark:** No, this is sampling, this is done separately. So here: tree location, tree count, species and variety classification — that's one page, isn't it? Canopy health index is another one. And then annual change detection.

**[00:54:22] Romain:** So I'm assuming change detection is going to be its own page for every module.

**[00:54:27] Mark:** Yeah, every module you'll have a sub-page saying change tracking or something. So for example I could click on fruit trees, it would tell me how many new fruit trees were planted, removed. Can it be gain or loss? And then if I want to sub-click, I have a breakdown for citrus or pomegranate if I want.

**[00:54:54] Romain:** What I'm wondering is, for this kind of page, is there a place in a row for a map? Because I'm someone who's quite visual and I would automatically put a map in there somewhere so that you can see the changes and where they are. I'm wondering if you agree with that.

**[00:55:16] Mark:** Tree location, tree count, species and variety classification — absolutely, definitely. Canopy health index is also a map. So the first four go together, whether it's one page or two pages — it's the same kind of map. Because once you have a tree count, you can have it colour-coded based on species or variety. Oh, this is a canopy health index per tree cluster, not by individual tree. So one, two and three is the individual trees; canopy health is tree cluster, so let's say by farm. And change detection is by farms. So canopy health and change detection are at the farm level. And the question is, annual change detection — do we even need to give them the information by farm? We do, I guess, because we have that information. So it's the emirate and provincial information, and then we can tell them which are the farms that contributed to this problem.

**[00:56:20] Romain:** Which might mean that a map is useful in that context as well.

**[00:56:29] Mark:** I don't think so. I don't think a map for annual change detection — they just need hard data.

**[00:56:42] Romain:** That's good to know. That's where I would differ, because I'm quite visual and my first question is always "where is that?". But if you think the detailed numbers are good enough, that's great.

**[00:57:00] Mark:** I think so. There's a danger in too many maps. It's hard data. And canopy health index — clusters. So I'm guessing the cluster of palm trees on a farm, the cluster of trees on a farm.

**[00:57:14] Romain:** I suppose so. Or trees that are close to one another.

**[00:57:22] Mark:** Actually, the farms are small enough — I would do it at the farm level. To me, tree cluster means farm. Because the farms all have the same source of water, they're all treated the same way, cultivated the same way, fertilised the same way. So "per tree cluster", because the farms are small here, can be at the farm level. Saudi Arabia, where they have three million trees, is different, but here it's very small and everything has the same source of water. So tree clusters by farm. And it's either one number for palm trees and fruit trees, or two numbers, one for palm trees and one for fruit trees. That's good enough.

**[00:58:09] Mark:** Let me go down to module three, structures. So the map would be helpful here. You have both land use and the map here, and then some raw numbers and then some searchable functions. So the concept is: we provide summary numbers at the emirate level, at the provincial level. Then we might have a long list of farms, but we're able to search — who has the worst score or the best score, the biggest change. So we have different categories: total acreage, increase in acreage from last year, decrease in acreage from last year, and so on, and then search on any one of those columns.

**[00:59:00] Romain:** So you want change detection on structure identification as well? It's not part of the deliverable, but—

**[00:59:09] Mark:** Let's not do it this year, because we don't have the history, but we would do it in a version two, once we have history.

**[00:59:24] Romain:** Well, the history is quarter to quarter, so we do structures every quarter. So we can say change from last quarter and change from 12 months ago. I suppose the change in structures is pretty slow — it's not like every day they remove an entire warehouse.

**[00:59:47] Mark:** No, but when it does happen they need to know. So it may be only five structures, but they need to know right away.

**[00:59:56] Romain:** Sounds good. So the first one is changes from last quarter.

**[01:00:10] Mark:** And maybe also changed from last year, I have to see it.

**[01:00:14] Romain:** We'll figure it out.

> **Module pages — decision:** each module becomes a **group of sub-pages**, not a single page. Standard sub-pages: inventory/classification (map allowed), and a **change tracking** sub-page per module (hard data, no map). All module pages report at emirate → province → farm level, with searchable/sortable tables. Maps shrink; quantities and charts take the space.
>
> **Tree monitoring:** tree location + count + species/variety classification on one page (map, colour-coded by species/variety). **Canopy health index is per farm**, not per tree — one number for palms and one for fruit trees is enough. Annual change detection: farm-level data, no map.
>
> **Structures:** tier 2 for the October rollout; tier 3 (distinguishing fertigation / filtration / pump room / desalination) needs investigation and may not be feasible. Change detection on structures is **v2** — but quarterly capture means quarter-on-quarter and 12-month change should be reported once history exists, and changes must surface immediately even if only a handful.
>
> Accuracy measurements in the proposal are validation done offline; they are **not** platform deliverables.

## Part 5 — Irrigation efficiency and yield forecast

**[01:00:16] Mark:** All right, efficiency — that's pretty straightforward. You have the emirate, the provinces, and then individual farms, and then you can search, like every farm in Al Ain that's flagged for priority intervention. Deliverables: IE score, IE band classification, zone average. Band classification and zone average are the same thing, that's fairly easy. You can give that to me at the emirate level and the provincial level. Quarter-to-quarter trend, that would be nice to show. I think a trend line.

**[01:01:14] Romain:** I think that can go into a similar page as the change detection — everything that's trend or progress timeline, that's a separate page. Because I feel that a map showing me who has improved is a bit confusing.

**[01:01:36] Mark:** I'd rather have a trend line. Raw numbers. And then to list for me the farms that deteriorated.

**[01:01:44] Romain:** At that scale I think that works best.

**[01:01:51] Mark:** So you could give me, for each farm, the score from last quarter, the score for this quarter, and then the percentage change or the number of points lost, and I could screen by who lost the most or who's got the worst score.

**[01:02:04] Romain:** One question — zone averages, what kind of zone are we talking about? Is it the three provinces?

**[01:02:16] Mark:** Yeah. If you want a further breakdown, we can do it. And if they want this broken down by field office — you probably have about 40 field offices — we'll do that later. We don't have the match of farms to the field offices.

**[01:02:36] Mark:** Irrigation detection was a mistake. That's the last part — flood irrigation, another violation. It was a mistake, it needs to be taken out.

**[01:02:57] Mark:** Down to yield forecast. What are the deliverables? Seasonal yield estimate, yield trend map. So here we are effectively saying the deliverable is a map? I don't think so. Listen, I would rather not put the map. If they want it, we'll put it back in. But to me it's simply to say, on tomatoes, what's the yield by farm, and then you can rank them by highest yield, lowest yield, or rank the ones that are below average.

**[01:03:43] Romain:** Makes sense. I think we agree on that.

**[01:03:50] Mark:** So your top table would say, here's the average yield for tomatoes and here's the percentage of farms that are below that yield. Production forecast, district level — I don't know what the district is, so I would make that the province, and then if they want further breakdown we can do that later.

**[01:04:26] Mark:** The system would tell me what's the season for tomatoes. Is that helpful to have in the platform?

**[01:04:39] Romain:** That's fine. We could show a simplified calendar on a month-to-month basis, with the different crops colour-coded.

**[01:04:50] Mark:** So if I were to pick tomatoes, would I then see two tables? I have a 12-month calendar, I have bar charts. One is number of dunums dedicated to tomatoes by month — so it's a bit of a wave — and one is number of farms dedicated to tomatoes. Two bar charts. And so there are zero farms doing tomatoes in August, but there are 6,000 farms doing tomatoes in September. So it shows the progression month by month, and the progression for dunums. That's the way I would do it.

**[01:05:38] Romain:** I think so too. It's not a hard start and a hard finish — you might have a couple of farms that do it super early, it can be a bit of a bell curve.

**[01:05:48] Mark:** And by farm and by area — cultivated area. I wouldn't do farm averages.

**[01:05:57] Romain:** That's what I mean, average.

**[01:06:00] Mark:** Total farms and total area. So the search — I could basically search by wheat, by sorghum, by lemon, by tomato.

**[01:06:19] Romain:** So you search at the crop level, with dates being one consolidated group. So do we agree that when you say "you can search", what we mean is you can filter? You have the taxonomy and you can filter for that specific one.

**[01:06:35] Mark:** Yes. Super simple. A taxonomy of a hundred products, categorised, and if I click on citrus then I get the two charts just for citrus.

**[01:06:53] Romain:** Sounds good. So we'd have a left pane with the taxonomy, as we have it right now, and then the breakdown by region and by province, and you can filter down for both the taxonomy and the province.

**[01:07:15] Mark:** Module five is only one metric, the yield forecast.

**[01:07:26] Romain:** And the accuracy measurement is something that we do offline to validate.

**[01:07:35] Mark:** The platform is driven by deliverables.

> **Irrigation efficiency — decision:** IE score, IE band classification and zone average, at emirate and province level (**zone = the three provinces**; field-office breakdown deferred, no farm-to-office mapping exists yet). Quarter-to-quarter trend as a **trend line on the change/trend sub-page, not a map**. Per-farm table: last quarter's score, this quarter's score, delta in percent or points, sortable to find the worst scores and biggest drops. **Flood-irrigation detection is removed** — it was a violation-tracking item included in error.
>
> **Yield forecast — decision:** drop the yield trend map. Per-crop yield by farm, rankable highest/lowest/below-average, with a top table giving the crop average and the percentage of farms below it. Production forecast at **province** level (the proposal's "district" is undefined). Add a **12-month crop calendar**: two bar charts per selected crop — dunums by month and farms by month — expected to read as a bell curve rather than hard start/end. Search means **filter via the left-hand taxonomy** (~100 products, dates consolidated), combinable with the region/province filter.

## Part 6 — Module six: the water module

**[01:07:41] Mark:** Module six, deliverables. So per-farm estimated crop water requirement — this is the crop calculator, that's the first one, that moves up. Monthly water demand, cubic metres per dunum, and the detail is per-farm estimated crop water requirement based on ET actuals and crop growth stage. So each farm has a number based on what they're growing. And the next one, seasonal water budget, seems like it's that same number. I'm not sure what's the difference between the two. Ah, so this second one says: for the entire — if he's growing tomatoes on 16 dunums, for the entire tomato cycle this is how much water that field needs.

**[01:11:11] Romain:** So monthly water demand is simply projecting how much water each farm will consume for the next three months or six months, after crop growth. Whereas seasonal water budget is different for each crop within that farm.

**[01:11:33] Mark:** You tell them, three dunums of tomatoes, knowing it's a three-month cycle, will cost you so much water. And that's useful, because then you can calculate the water consumption per kilo of that particular crop.

**[01:11:57] Romain:** That makes sense. So it's kind of the same total amount of water, but divided in a different way.

**[01:12:11] Mark:** Per crop. Monthly is: for this month he gets so much water because it's growing — it's more a 30-day forecast. The other one is saying, specifically to the corn he's growing, that corn is a six-month cycle, he's got so many dunums, this is how much water that will consume. The calculation there would be more than average, but maybe it's also searchable by farm — litres or cubic metres per kg.

**[01:12:45] Mark:** Okay, over-allocation.

**[01:12:49] Romain:** That's the irrigation efficiency rating, isn't it? What I'm understanding is that it's actually the seasonal water budget compared with the actual usage. So if you set a budget for the crop based on the previous year, and then you compare that to the actual water used, then you have an over-allocation.

**[01:13:16] Mark:** But the problem with comparing this to the seasonal is, by the time you measure the full season it's too late. I think it's monthly water demand. So we're saying that this guy should be consuming a hundred cubic metres, or a thousand cubic metres of water, and we're noticing that his trend is going to push him towards 1,300. So it's him exceeding the monthly water demand. You then do another over-allocation flag, which you then reflect on the individual farm report.

**[01:13:57] Romain:** This water demand — we're also having teams on site verifying the numbers on the fields, because I'm assuming this is a bit of an assumption, right, the water use?

**[01:14:14] Mark:** No, it's scientific. It's precision agriculture.

**[01:14:17] Romain:** No, I'm saying for us.

**[01:14:20] Mark:** You go to the bottom, there's the accuracy target and the verification measurement.

**[01:14:26] Romain:** Accuracy measurement, yeah. It's going to be a bit intense.

**[01:14:31] Mark:** Validation's there.

**[01:14:33] Romain:** I agree with you, the whole thing's a bit… Imagine flagging these poor farmers and actually they're using less water than they should.

**[01:14:47] Mark:** Water allocation per crop.

**[01:14:57] Romain:** That feels closely related to the seasonal water budget, because it's also per crop.

**[01:15:04] Mark:** No, seasonal is a bit different. Seasonal is more a calculation for ADAFSA than for anybody else. You could say to ADAFSA, you have so many farms growing tomatoes, it's typically a three-month growth cycle, and each dunum will consume so much water. So your tomatoes in general are going to cost you so much water. That's what supports ADAFSA's water allocation planning. So ADAFSA might say, well, we're going to ban tomatoes because they're consuming too much water. Whereas water allocation per crop is more monthly or weekly.

**[01:15:49] Romain:** Makes sense.

**[01:15:53] Mark:** In fact, your water allocation per crop feeds into your seasonal water budget in a way.

**[01:16:01] Romain:** So with water allocation per crop, I know that this farm should be consuming so much for his tomatoes, so much for his wheat, so much for his fruit trees — and he's over-consuming.

**[01:16:24] Mark:** The over-allocation flag — you break it down by crop. So the over-allocation flag is that he's exceeding the water demand, but the water allocation per crop tells you where he's exceeding.

**[01:16:36] Romain:** So it's baseline versus actual.

**[01:16:38] Mark:** So those two go together. The first two — monthly water demand and seasonal water budget — go together, and over-allocation and water allocation go together, because one feeds into the other. The farm is over-consuming, click, aha, it's the citrus trees where there's a problem. Now crop coverage.

**[01:17:03] Romain:** I'm assuming this is the same kind of metric as we discussed for the overview page — it's stock.

**[01:17:10] Mark:** So you're thinking the same chart, but instead of months it's water consumption? For example, if I pick citrus, it shows me for every month the consumption by all citrus trees in whatever region for that month.

**[01:17:48] Romain:** I hadn't thought of the monthly split. I had assumed this is timeless, per season, per crop season. But maybe it's a month.

**[01:18:02] Mark:** But crop season is the seasonal water budget.

**[01:18:07] Romain:** Well, isn't that baseline versus actual?

**[01:18:15] Mark:** Baseline would be seasonal water budget. That's a calculated budget. But crop coverage is the actual use for crops?

**[01:18:23] Romain:** I think the actual use is the over-allocation flag.

**[01:18:28] Mark:** I think we need to be careful about getting into too much detail. So part of it is predictive — the seasonal water budget is predictive. The monthly water demand is an allocation: we are allocating so much to the farmer. So the monthly water demand, water allocation per crop, and the over-allocation flag actually go together.

**[01:19:00] Romain:** That's how I understand it too.

**[01:19:02] Mark:** And seasonal water budget and crop coverage go together. My best understanding is that under seasonal water budget you have some sort of table that tells you: here's how many farms and how many dunums of tomatoes, here's what those tomatoes are going to produce, and this is what it's going to cost you in water over the growing season. Because it's part of their water allocation planning — if they authorise so many farms to grow tomatoes, this is the amount of water that's required. And then crop coverage — my suggestion, but maybe you don't agree, is a simple map that says by crop, by month, total water consumption across Abu Dhabi, daily average for each month. In the absence of something else. Well, I'm looking at the other modules — crop coverage is also in module five, yield forecast, as well as model input. So I'm wondering if crop coverage and model input are just base numbers to show the clients what's being taken in, rather than an actual focus on water allocation. Crop coverage is just saying we've surveyed X amount of tomatoes. I understand crop coverage is not a deliverable, it's just in the wrong table.

**[01:20:52] Romain:** Got it. You're right, because formula inputs isn't really a deliverable either, right, below crop coverage?

**[01:21:02] Mark:** Correct.

**[01:21:05] Romain:** But crop coverage is still a metric that will show in the app, so it's good. And formula inputs as well — it's good to show it somewhere, in a "more info" pop-up or something. And "phased by Abu Dhabi crop calendar" — I'm not sure that's all that relevant, in the sense that it's phased by what the farmers are growing.

**[01:21:34] Mark:** Right. The farmer is going to grow tomatoes in August. So the Abu Dhabi crop calendar is essentially the farm calendar. Great point. Crop coverage is a parameter. I just want to make sure we capture all this. They don't put trees, huh? I don't see any.

**[01:21:58] Romain:** Definitely we don't have any of the forest trees. The question is, do we put the fruit trees in here or not? Let me see if they mention fruit trees. Yes, they mention fruit trees in yield forecast.

**[01:22:11] Mark:** So we should have fruit trees.

**[01:22:13] Romain:** Easy to do that. They have 16 mentions of fruit trees, so that's definitely part of it.

**[01:22:17] Mark:** Good catch. So back to slide 10, monthly water demand. Your water allocation per crop gives you your monthly water demand per farm, and that tells you the over-allocation flag is exceeding.

**[01:22:38] Romain:** Exactly. So you have a budget versus an actual.

**[01:22:45] Mark:** And then the seasonal water budget is a different calculation, which is to say, for the entire tomato season — well, it really is, how sustainable is it to grow almonds at that time. So that might be a separate — I think it's two tables, and seasonal water budget is separate. Which is an amazing tool for policy design. The measurement I would at least add is cubic metres per…

**[01:23:32] Romain:** Cubic metres per weight of production.

**[01:23:39] Mark:** Cubic metres per kilo, I think.

**[01:23:44] Romain:** That's a very interesting number.

**[01:23:47] Mark:** I think so too. Anyway, this is a ton of work, yeah?

**[01:23:50] Romain:** No, I think it'll be fine. It's a top-down approach. As soon as we have the navigation settled and the general layout of the pages, the rest will flow through quite easily.

> **Water module — decision:** the six items split into **two pairs plus two parameters.**
>
> *Pair 1 — operational, baseline vs actual (these three go together):* **monthly water demand** (per-farm allocation, ~30-day forecast, m³/dunum from ET actuals and crop growth stage) → **water allocation per crop** (same, broken down per crop within the farm, monthly/weekly) → **over-allocation flag** (raised against the *monthly* demand, not the seasonal budget — by season's end it is too late to act; the per-crop breakdown tells you *where* the farm is over-consuming). The flag surfaces on the individual farm report.
>
> *Pair 2 — planning, predictive:* **seasonal water budget** (per crop cycle: N farms × N dunums of tomatoes over a 3-month cycle = this much water and this much production) — a policy tool for ADAFSA's allocation planning, paired with **crop coverage**.
>
> **Crop coverage and formula inputs are not deliverables** — they are model parameters listed in the wrong table. Still worth surfacing as base numbers, formula inputs behind a "more info" pop-up. **"Phased by Abu Dhabi crop calendar" = the farm calendar**, no separate artefact.
>
> Add **cubic metres per kilo of production** as a derived metric, searchable by farm. **Fruit trees must be included** in this module (16 mentions in the proposal); forest trees are not covered.

## Part 7 — Farm-level page, MMC leftovers, and next steps

**[01:24:12] Romain:** It might take a bit more time than tonight. Maybe by tomorrow night I might be able to send you something, if that works.

**[01:24:23] Mark:** That works. And it's a bit less of a rush, in the sense that I think we have about a month to get this thing out — a month for production.

**[01:24:36] Romain:** So I'll send something to you tomorrow. I'll also have the changes we discussed on the farm app — I made them last night, so I can send you a version 1.5.7.

**[01:25:24] Mark:** And then there's a whole other discussion about farm-level survey. This was an example — the one we showed the DG — of the kind of information you want to have at the farm level. What they're producing, irrigation efficiency, skip the violations, and maybe skip data confidence. But at the high level: what crops do they do, then the breakdown, the irrigation efficiency, and then maybe another section on critical issues. For each farm there are two pages: one is basic stats, maybe it looks like this; and the second page is on corrective actions, like over-consumption or soil health.

**[01:26:52] Romain:** One question for you before you go. MMC's basic platform had a detailed page with the actual farm analysis, where you could see on the map the irrigation efficiency, yield forecast and so on. This is an enhanced version of it, but they also have tons of numbers related to the crop growth phase, the water schedule, the soil moisture. Is this something we need, or is this too much for a government-level platform?

**[01:27:36] Mark:** Too much for government. It's not our deliverables. It'll be in the farmer app, for the farmer.

**[01:27:43] Romain:** Exactly, that's what I thought. So when we say farmer alerts, we're pretty much alerts related to over water consumption.

**[01:27:53] Mark:** That's kind of it. And fallow lands, but that's a much longer process.

**[01:28:10] Romain:** That doesn't sound like much information then.

**[01:28:16] Mark:** Well, that's just for the warnings. But what you have is the yields, the water and usage, the breakdown. So let me go back to the proposal, just to make sure you understand what we're providing. Seasonal crop monitoring — we could tell them they grew tomatoes last year but not this year. This one may require more work. Actually, this one could be a question — we might do a second version with them, because for tree and fruit… Or maybe on that page we can show what are they growing now and what they grew last year, but that's too early for us. So basically one piece is what are they growing now, right?

**[01:29:22] Romain:** Yeah.

**[01:29:24] Mark:** So that's module one, module two, and then module four, module five and module six is what we have. Alerts. And if ADAFSA wants other alerts or reports, that's fine, we can do that. So that heat map you were showing me — is that useful if you're an inspector?

**[01:29:57] Romain:** It exists, but this is not information we are collecting — we're not collecting soil moisture and temperature.

**[01:30:22] Mark:** Exactly.

**[01:30:24] Romain:** So this is a remnant of MMC's actual platform, which we'll strip out. I don't think this is really useful, because it's just for farmers — you don't really need to know the current weather or the soil moisture.

**[01:30:41] Mark:** And you're showing me here the app, or the platform?

**[01:30:44] Romain:** That's the platform. It's just there because it was on MMC's page, but it's not linked to any deliverables, so I really don't think we should keep it. So I'll remove that.

**[01:30:56] Mark:** But another thought, when we present — this will be in the farm app, the big producer platform. Because we have a demo we have to plan with [*company name unclear*], which is a direct run for a demo to any of the big agricultural producers, multi-farm producers we have. And I think I might need you to present, and think through what you want to show them. You may have to cheat a little bit and take different screens, because we don't have a platform quite yet. I wonder if we can either show them a live platform or a series of pictures from your requirements document to explain how it works.

**[01:31:52] Romain:** I agree. When is that demo going to take place? That will probably need a few days of notice to prepare.

**[01:32:03] Mark:** I need to find a Turkish speaker, that's going to take some time. I got in touch with them, they're very interested, but they only speak Azerbaijani and Turkish. So I can push it back. If you do it early next week — in 10 days, if you need some time. 10 days good?

**[01:32:38] Romain:** It's not about pushing back, it's more about having enough days of notice so that we can prepare for it, but also enough time to do everything.

**[01:32:48] Mark:** I need to go find the translator, so I was thinking 10 days basically, so a week from Monday.

**[01:32:56] Romain:** 10 days, that works.

**[01:32:58] Mark:** So keep in mind as you do all these things that you also need to do a demo, specifically on the platform capabilities.

**[01:33:04] Romain:** That makes sense. We could do it live, but I'm assuming we'll want to show them the web platform for admin-level people, and then the farmer app as well on phone. I think that's going to be a big seller. So there are two streams here.

**[01:33:26] Mark:** And it's okay just to say to them, for the app — maybe the platform is live, so you can see the satellite pictures, and the app is more of the PowerPoint version, and we're about to republish it in your language, so it should be available to you in 30 days.

**[01:33:44] Romain:** That's fine. Are we okay using some of this anonymised data from Abu Dhabi?

**[01:33:52] Mark:** Yeah, use the Abu Dhabi data.

**[01:34:09] Mark:** So you're thinking by Monday we can send this document to MMC?

**[01:34:17] Romain:** Yeah, Monday, Tuesday, whatever you can manage.

**[01:34:20] Mark:** And do you think we should insist on talking to the team so we can walk them through the logic, or do you think it's self-explanatory?

**[01:34:27] Romain:** I think talking — having a direct connection with the team is always going to be more efficient, quicker. Any questions they have, they can come back to us and say, how do you want this? I'm a big proponent for that.

**[01:34:43] Mark:** Let me push for that. I'll insist that we talk to the people who are driving this, and that way they can come back with quick questions — otherwise they guess and they do the wrong thing.

**[01:34:56] Romain:** Exactly. See how you get on with Neil — don't pressure him too much and hurt the relationship, but if we can have that, that'd be amazing.

**[01:35:05] Mark:** We can always have one of his sales team on the call to manage the relationship. What's worked in the past is you have the tech guys, a bit nerdy, you get the sales guy in between to manage things, and then we're on the back end.

> **Individual farm page — decision:** two pages per farm. **Page 1, basic stats:** crops grown, breakdown, irrigation efficiency. **Page 2, corrective actions:** over-consumption, soil health. Violations and data confidence are dropped.
>
> **Strip the MMC leftovers.** The soil-moisture / temperature / weather heat map, crop growth phase and water schedule panels are remnants of MMC's own farmer-facing product. They are not ADAFSA deliverables and we do not collect that data — remove them from the government platform. That content belongs in the farmer app.
>
> **Farmer alerts** are essentially over-water-consumption alerts, plus fallow land later.

---

## Next steps

1. **Romain** — rework the mockup: new navigation pane, module sub-page groups, and quick draft layouts for the three page levels. Auto-generate the PowerPoint from the mockup (no extra manual work). Target: **the day after the call**.
2. **Romain** — send **farm app v1.5.7** with the previously agreed changes.
3. **Both** — review the reworked mockup together, then send the document to MMC around **Monday/Tuesday**.
4. **Mark** — push MMC (via Neil) for **direct access to the engineering team**, with an MMC sales contact on the call to manage the relationship, so questions come back to us instead of being guessed at.
5. **Timeline** — roughly **one month to production**. Structures tier 2 targets the **October rollout**.
6. **Demo** — Azerbaijan producer demo in about **10 days** (a week from Monday), gated on Mark finding a Turkish/Azerbaijani speaker. Two streams: web platform live for admin users, farmer app as a PowerPoint walkthrough with a "republished in your language within 30 days" message. Anonymised Abu Dhabi data may be used.

## Open questions

- Whether crop location, crop type classification and cultivated area sit on **one sub-page or three** (Romain to work out in the mockup).
- Whether structures change detection reports **quarter-on-quarter, year-on-year, or both**.
- **District level** in the production forecast deliverable is undefined — being read as province until ADAFSA clarifies.
- Field-office breakdown (~40 offices) is wanted eventually, but **no farm-to-office mapping exists** yet.
- Whether tier 3 structure classification (fertigation vs filtration vs pump room vs desalination) is technically achievable at all — Romain doubts it.
- Crop **production** figures on the overview page: agreed as desirable, deferred; seasonality makes the measurement window unclear.

## Uncertain terms

The recording is a screen-share call with overlapping speech; the following were unclear and are flagged rather than silently guessed:

- **[01:31:11]** the company name for the Azerbaijan demo is not intelligible.
- **[01:26:48] "soil health"** — inferred from context (list of corrective actions on the farm page); could also be *crop health*.
- **[01:00:29] "IE score / IE band classification"** — the audio renders these as "IER score / IER bank classification"; read against the slide-7 deliverables list.
- **[01:03:07] "seasonal yield estimate, yield trend map"** — "yield trend map" is confirmed by Mark's reaction to it; the decision was to drop the map.
- **[00:37:37]** Mark's reordering instruction is partly garbled; the resulting order is cereals → fodder → open field → date palm → fruit → forest.
- Throughout, **ADAFSA** was transcribed by the model as "DevSA / Defsa / dev set / adapts off"; **MMC (MapMyCrop)** as "MNC / not my crop"; **dunums** as "donors / donuts / Dunham's"; **Al Dhafra** as "Dafra"; **Madinat Zayed** as "Matinata Zayek". All corrected.

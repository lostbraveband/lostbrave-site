# How to update LostBrave.com

All updates happen on github.com in your web browser, on your phone or computer. Open a file, click the pencil icon to edit it, then click **Commit changes**. Give it about a minute and refresh the site. Nothing to install, nothing to pay for.

---

## Shows: `content/shows.csv`
Add one line per show, in this order: `date,time,venue,city,details,link`

Example:
`2027-01-16,8:00 PM,Cactus Club,"Milwaukee, WI",With Kitty Softpaw,https://tickets.example.com`

- Write dates as **YYYY-MM-DD**. 11/7/2026 also works.
- If a field has a comma in it, wrap it in "quotes".
- Leave unused fields empty, but keep the commas.
- The next upcoming show automatically appears as the ticket stub at the top of the home page.
- Once a show's date passes, it moves to "Where we've played" on its own. Never delete old shows: they become your show history on the booking kit.

## Photos: `photos` folder
Open the folder, choose **Add file → Upload files**, drag in the pictures, and commit.
- The site tints every photo in the band's blue and amber so they look like one set. Hovering or clicking shows full color.
- Newest appear first if you start file names with the date, e.g. `2026-11-07-linnemans-crowd.jpg`. The words after the date become the caption.
- To remove a photo, open it, click **⋯**, then **Delete file**.

## Big top photo: `images/hero.jpg`
Upload one wide, landscape photo named exactly `hero.jpg`. It's also the preview image when someone shares the link.

## Shirts: `merch` folder and `content/merch.csv`
- Drop shirt photos into `merch`. They show in full color.
- Edit item names, prices and descriptions in `content/merch.csv`.
- The "Message us on Instagram / Facebook" buttons appear automatically.

## Videos: `content/videos.csv`
Put the video on YouTube, then add a line: `Song title – Live at Linneman's,https://youtu.be/XXXXXXXXXXX`

## Links: `content/links.csv`
Each row is `type,label,url`. Paste the address after the last comma.
- Streaming links go on the `listen` rows (Spotify, Apple Music, Bandcamp and so on). Add a YouTube channel to the `social` row once you have one.
- Rows with no address stay hidden.

## Band members: `content/members.csv`
One line per person: `name,plays`. If what someone plays includes a comma, put it in "quotes". The list shows on the home page and the booking kit.

## Words
- `content/tagline.txt`: the line under the band name.
- `content/lyrics.txt`: the lyric under the band name. A different random line shows on each visit. Add one per line, written as
  `lyric line | Song title`
  e.g. `No waiting for the weekend to swallow down our weak ends. | Priorities`
  Lines starting with # are notes and don't show.
- `content/about.txt`: The band section. Leave a blank line between paragraphs. The first paragraph shows larger.
- `content/music-note.txt`: the sentence at the top of Listen.

---

## Booking kit (hidden page for venues and agents)
**Link to share:** `https://lostbrave.com/booking-kit/`
Nothing on the main site links to it, and search engines are told to skip it. Only people you send the link to will find it.

What's on it, and where to update each part:

| Section | Where to update |
|---|---|
| Stage plot | Upload a PDF or image to `booking-kit/stage-plot` |
| Logos | Upload to `booking-kit/logos`. A PNG with a transparent background is best. |
| Press photos | Upload full-resolution, approved shots to `booking-kit/press-photos` |
| Quick facts | `content/kit-facts.csv` (rows left blank are hidden). Fill in Set length and Draw when ready. |
| About | `content/kit-pitch.txt`. If left empty, it uses the home page bio. |
| Tech and input notes | `content/kit-tech.txt`: input list, backline, what you bring |
| Video | `content/kit-videos.csv`. If left empty, it uses the home page videos. |
| Recent shows | Pulled automatically from `content/shows.csv` |

Every file has its own Download button. Upload photos at full size here; the page shows small previews but downloads the originals.

To make the address harder to guess, rename the `booking-kit` folder (e.g. `booking-kit-2027`) and share the new link.

## Contact form and mailing list
- Both forms send an email to the inbox you used to create the Web3Forms key. Your address never appears on the site.
- Contact messages arrive with a subject like "LostBrave.com: Booking a show from Jim". Hit Reply to answer the sender directly.
- Mailing-list signups arrive as "Mailing list signup: name@example.com". Tip: make an email filter for that subject, then copy the addresses into a spreadsheet. When you're ready to send a newsletter, a free tool like MailerLite can import that list.
- Hidden spam traps are built into both forms.
- **booking@lostbrave.com** forwards through ImprovMX. Change where it forwards in your ImprovMX dashboard. The address is shown only on the booking kit, and it's written into `config.js` in two parts so spam bots have a harder time collecting it.

## If something looks wrong
Most problems come from a missing comma or quote in a .csv line. Open the file and click **History** to see what changed. GitHub keeps every version, so nothing is ever lost.

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, ArrowLeft, Sparkles, Copy, Check, RefreshCw, Hash, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', icon: Sparkles, color: '#00F2EA' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
]

const STYLES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'funny', label: 'Lustig' },
  { id: 'provocative', label: 'Provokant' },
  { id: 'storytelling', label: 'Storytelling' },
]

const LENGTHS = [
  { id: 'short', label: 'Kurz', desc: '1-2 Satze' },
  { id: 'medium', label: 'Mittel', desc: '3-4 Satze' },
  { id: 'long', label: 'Lang', desc: '5+ Satze' },
]

const DEMO_CAPTIONS = {
  instagram: {
    professional: {
      short: 'Qualitat spricht fur sich selbst. Unser neues Projekt zeigt, was mit Leidenschaft und Prazision moglich ist.',
      medium: 'Qualitat spricht fur sich selbst. Unser neues Projekt zeigt, was mit Leidenschaft und Prazision moglich ist. Jedes Detail wurde sorgfaltig durchdacht, um ein Ergebnis zu liefern, das begeistert. Wir sind stolz auf das, was wir gemeinsam geschaffen haben.',
      long: 'Qualitat spricht fur sich selbst. Unser neues Projekt zeigt, was mit Leidenschaft und Prazision moglich ist. Jedes Detail wurde sorgfaltig durchdacht, um ein Ergebnis zu liefern, das begeistert. Wir sind stolz auf das, was wir gemeinsam geschaffen haben. Von der ersten Idee bis zur finalen Umsetzung war es ein spannender Weg. Danke an alle, die diesen Prozess begleitet haben.',
    },
    casual: {
      short: 'Okay wow, das ist echt gut geworden! Was sagt ihr dazu?',
      medium: 'Okay wow, das ist echt gut geworden! Hab so lange daran gearbeitet und bin mega happy mit dem Ergebnis. Manchmal muss man einfach dranbleiben. Was sagt ihr dazu?',
      long: 'Okay wow, das ist echt gut geworden! Hab so lange daran gearbeitet und bin mega happy mit dem Ergebnis. Manchmal muss man einfach dranbleiben, auch wenn es nicht sofort klappt. Der Weg dahin war wild, aber genau das macht es so besonders. Schreibt mir in die Kommentare, was ihr davon haltet! Und speichert euch den Post fur spater.',
    },
    funny: {
      short: 'Mein Talent? Unbezahlbar. Mein WiFi? Leider nicht.',
      medium: 'Mein Talent? Unbezahlbar. Mein WiFi? Leider nicht. Aber hey, zwischen Kaffee Nr. 4 und einem kleinen Nervenzusammenbruch ist das hier entstanden. Ich nenne es Kunst, mein Therapeut nennt es Vermeidungsverhalten.',
      long: 'Mein Talent? Unbezahlbar. Mein WiFi? Leider nicht. Aber hey, zwischen Kaffee Nr. 4 und einem kleinen Nervenzusammenbruch ist das hier entstanden. Ich nenne es Kunst, mein Therapeut nennt es Vermeidungsverhalten. Spass beiseite, ich bin wirklich stolz darauf. Auch wenn der Weg dahin so chaotisch war wie mein Schreibtisch. Liked den Post, damit ich meiner Mama zeigen kann, dass sich das Studium doch gelohnt hat.',
    },
    provocative: {
      short: 'Alle reden davon. Wir machen es einfach. Bist du bereit?',
      medium: 'Alle reden davon. Wir machen es einfach. Wahrend andere noch planen, liefern wir Ergebnisse. Das ist der Unterschied zwischen Traumen und Machen. Bist du bereit, den nachsten Schritt zu gehen?',
      long: 'Alle reden davon. Wir machen es einfach. Wahrend andere noch planen, liefern wir Ergebnisse. Das ist der Unterschied zwischen Traumen und Machen. Die meisten werden das hier sehen und weiterscrollen. Aber die wenigen, die es verstehen, werden handeln. Genau fur euch ist das hier. Der Moment ist jetzt. Bist du bereit, den nachsten Schritt zu gehen?',
    },
    storytelling: {
      short: 'Vor einem Jahr hatte ich eine Idee. Heute halte ich das Ergebnis in den Handen.',
      medium: 'Vor einem Jahr hatte ich eine Idee. Alle haben gesagt, das wird nichts. Heute halte ich das Ergebnis in den Handen und bin sprachlos. Manchmal braucht es nur den Mut, den ersten Schritt zu machen.',
      long: 'Vor einem Jahr hatte ich eine Idee. Alle haben gesagt, das wird nichts. Ich hatte Zweifel, schlaflose Nachte und Momente, in denen ich fast aufgegeben hatte. Aber irgendetwas in mir hat mich weitergetrieben. Heute halte ich das Ergebnis in den Handen und bin sprachlos. Diese Reise hat mich mehr gelehrt als jedes Buch es konnte. Manchmal braucht es nur den Mut, den ersten Schritt zu machen.',
    },
  },
  tiktok: {
    professional: {
      short: 'Professionell umgesetzt. Das Ergebnis spricht fur sich.',
      medium: 'Professionell umgesetzt und jedes Detail zahlt. Wenn du wissen willst, wie wir das geschafft haben, folge uns fur mehr Behind-the-Scenes. Das Ergebnis spricht fur sich.',
      long: 'Professionell umgesetzt und jedes Detail zahlt. Von der Planung bis zur finalen Version war es ein intensiver Prozess. Aber genau das macht den Unterschied. Wenn du wissen willst, wie wir das geschafft haben, folge uns fur mehr Behind-the-Scenes. Mehr davon kommt bald. Das Ergebnis spricht fur sich.',
    },
    casual: {
      short: 'POV: Es ist endlich fertig und du bist mega stolz drauf',
      medium: 'POV: Es ist endlich fertig und du bist mega stolz drauf. Hab legit 3 Tage daran gesessen und jetzt ist es endlich done. Sagt mir in den Comments was ihr denkt!',
      long: 'POV: Es ist endlich fertig und du bist mega stolz drauf. Hab legit 3 Tage daran gesessen, gefuhlt 100 Mal von vorne angefangen, aber jetzt ist es endlich done. Der Moment wo es klick macht ist einfach unbezahlbar. Sagt mir in den Comments was ihr denkt! Und folgt fur mehr solchen Content.',
    },
    funny: {
      short: 'Ich so: Ich mach das schnell. 47 Stunden spater...',
      medium: 'Ich so: Ich mach das schnell. 47 Stunden und 12 Kaffees spater stehe ich hier und frage mich, wo mein Wochenende geblieben ist. Aber hey, wenigstens sieht es gut aus.',
      long: 'Ich so: Ich mach das schnell. 47 Stunden und 12 Kaffees spater stehe ich hier und frage mich, wo mein Wochenende geblieben ist. Mein Schlafrhythmus? Kaputt. Meine Motivation? Fraglich. Das Ergebnis? Eigentlich ganz nice. Folgt fur mehr chaotische Energie. Mein Schlaf wird es mir nicht danken, aber mein Feed schon.',
    },
    provocative: {
      short: 'Das will keiner horen, aber es ist die Wahrheit.',
      medium: 'Das will keiner horen, aber es ist die Wahrheit. 90% geben auf, bevor es interessant wird. Die restlichen 10% machen genau das hier. Auf welcher Seite stehst du?',
      long: 'Das will keiner horen, aber es ist die Wahrheit. 90% geben auf, bevor es interessant wird. Die restlichen 10% machen genau das hier. Der Unterschied ist nicht Talent. Es ist nicht Gluck. Es ist die Entscheidung, weiterzumachen, wenn es schwer wird. Auf welcher Seite stehst du? Lass es mich in den Comments wissen.',
    },
    storytelling: {
      short: 'Das hat alles verandert. Swipe fur die ganze Story.',
      medium: 'Vor 6 Monaten stand ich genau hier und hatte keine Ahnung, was passieren wurde. Heute kann ich es kaum glauben. Das hat alles verandert.',
      long: 'Vor 6 Monaten stand ich genau hier und hatte keine Ahnung, was passieren wurde. Ich war kurz davor aufzugeben. Dann kam dieser eine Moment, der alles verandert hat. Was danach passierte, hatte ich nie fur moglich gehalten. Heute stehe ich hier und bin dankbar fur jeden einzelnen Schritt. Folgt fur Teil 2 der Story.',
    },
  },
  youtube: {
    professional: {
      short: 'In diesem Video zeigen wir euch den kompletten Prozess hinter unserem neuesten Projekt.',
      medium: 'In diesem Video zeigen wir euch den kompletten Prozess hinter unserem neuesten Projekt. Von der ersten Idee bis zum fertigen Ergebnis nehmen wir euch mit auf die Reise. Lasst ein Abo da, um keine Updates zu verpassen.',
      long: 'In diesem Video zeigen wir euch den kompletten Prozess hinter unserem neuesten Projekt. Von der ersten Idee bis zum fertigen Ergebnis nehmen wir euch mit auf die Reise. Ihr erfahrt, welche Herausforderungen wir meistern mussten und welche Learnings wir mitgenommen haben. Lasst ein Abo da und aktiviert die Glocke, um keine Updates zu verpassen. Timestamps findet ihr in den Kommentaren.',
    },
    casual: {
      short: 'Yo Leute, heute zeig ich euch was richtig Cooles! Schaut bis zum Ende.',
      medium: 'Yo Leute, heute zeig ich euch was richtig Cooles! Hab mega lange daran gearbeitet und kann es kaum erwarten, euch das Ergebnis zu zeigen. Lasst ein Like da, wenn es euch gefallt. Schaut bis zum Ende!',
      long: 'Yo Leute, heute zeig ich euch was richtig Cooles! Hab mega lange daran gearbeitet und kann es kaum erwarten, euch das Ergebnis zu zeigen. In diesem Video nehme ich euch mit durch den ganzen Prozess. Es wird wild, versprochen. Lasst ein Like da und schreibt mir in die Kommentare, was ihr davon haltet. Schaut unbedingt bis zum Ende, da kommt noch eine Uberraschung!',
    },
    funny: {
      short: 'Willkommen zuruck zu einem weiteren Video, in dem ich Dinge tue, die niemand gefragt hat.',
      medium: 'Willkommen zuruck zu einem weiteren Video, in dem ich Dinge tue, die niemand gefragt hat. Aber hey, ihr seid hier, also kann es so schlimm nicht sein. Heute wird es besonders chaotisch. Ihr wurdet gewarnt.',
      long: 'Willkommen zuruck zu einem weiteren Video, in dem ich Dinge tue, die niemand gefragt hat. Aber hey, ihr seid hier, also kann es so schlimm nicht sein. Heute wird es besonders chaotisch, denn ich hab mal wieder eine Idee gehabt um 3 Uhr nachts. Ihr kennt das. Die besten Ideen kommen, wenn der Verstand langsam aufgibt. Liked das Video, damit der Algorithmus mich nicht komplett vergisst. Ihr wurdet gewarnt.',
    },
    provocative: {
      short: 'Dieses Video wird euch die Augen offnen. Die Wahrheit, die keiner ausspricht.',
      medium: 'Dieses Video wird euch die Augen offnen. Was ich euch heute zeige, traut sich kaum jemand auszusprechen. Aber genau deshalb mache ich diesen Content. Die unbequeme Wahrheit verdient eine Plattform.',
      long: 'Dieses Video wird euch die Augen offnen. Was ich euch heute zeige, traut sich kaum jemand auszusprechen. Aber genau deshalb mache ich diesen Content. Die unbequeme Wahrheit verdient eine Plattform. In den nachsten Minuten werde ich alles offenlegen. Wenn ihr anderer Meinung seid, schreibt es in die Kommentare. Diskussion ist erwunscht. Aber erst das ganze Video anschauen.',
    },
    storytelling: {
      short: 'Diese Geschichte musste ich mit euch teilen. Sie hat mein Leben verandert.',
      medium: 'Diese Geschichte musste ich mit euch teilen. Was vor einem Jahr als kleines Experiment begann, hat sich zu etwas entwickelt, das mein Leben komplett verandert hat. In diesem Video erzahle ich euch alles.',
      long: 'Diese Geschichte musste ich mit euch teilen. Was vor einem Jahr als kleines Experiment begann, hat sich zu etwas entwickelt, das mein Leben komplett verandert hat. In diesem Video erzahle ich euch von den Hohen und Tiefen, den unerwarteten Wendungen und dem Moment, in dem alles Sinn ergab. Macht es euch gemutlich, denn diese Story ist es wert, bis zum Ende geschaut zu werden. Lasst mir ein Abo da, wenn euch solche Geschichten interessieren.',
    },
  },
  twitter: {
    professional: {
      short: 'Neues Projekt live. Die Ergebnisse sprechen fur sich.',
      medium: 'Neues Projekt live. Nach Wochen intensiver Arbeit sind wir stolz auf das Ergebnis. Qualitat braucht Zeit, und diese Zeit haben wir uns genommen. Die Ergebnisse sprechen fur sich.',
      long: 'Neues Projekt live. Nach Wochen intensiver Arbeit sind wir stolz auf das Ergebnis. Qualitat braucht Zeit, und diese Zeit haben wir uns genommen. Jedes Detail wurde optimiert, jeder Prozess hinterfragt. Das Feedback bisher ist uberwalgend. Danke an alle Beteiligten. Die Ergebnisse sprechen fur sich. Thread folgt.',
    },
    casual: {
      short: 'okay das ist SO gut geworden ich kann nicht',
      medium: 'okay das ist SO gut geworden ich kann nicht. hab gefuhlt ewig daran rumgebastelt aber jetzt? no regrets. was sagt ihr?',
      long: 'okay das ist SO gut geworden ich kann nicht. hab gefuhlt ewig daran rumgebastelt, zwischendurch dreimal fast aufgegeben, aber jetzt? no regrets. manchmal muss man einfach durchziehen. was sagt ihr dazu? retweet wenn ihr das kennt.',
    },
    funny: {
      short: 'Mein Talent: Dinge anfangen. Meine Schwache: Dinge beenden. Heute: Ausnahme.',
      medium: 'Mein Talent: Dinge anfangen. Meine Schwache: Dinge beenden. Aber heute ist eine historische Ausnahme, denn ich habe tatsachlich etwas fertig gemacht. Markiert den Tag im Kalender.',
      long: 'Mein Talent: Dinge anfangen. Meine Schwache: Dinge beenden. Aber heute ist eine historische Ausnahme, denn ich habe tatsachlich etwas fertig gemacht. Meine Mama ist stolz, mein Hund verwirrt, und mein innerer Kritiker schweigt ausnahmsweise mal. Markiert den Tag im Kalender. Das passiert nicht nochmal so schnell.',
    },
    provocative: {
      short: 'Unpopular opinion: Die meisten machen es falsch. Hier ist warum.',
      medium: 'Unpopular opinion: Die meisten machen es falsch. Nicht weil sie es nicht konnen, sondern weil sie den bequemen Weg wahlen. Hier ist, was wirklich funktioniert.',
      long: 'Unpopular opinion: Die meisten machen es falsch. Nicht weil sie es nicht konnen, sondern weil sie den bequemen Weg wahlen. Was wirklich funktioniert, ist unbequem, zeitaufwendig und erfordert echten Einsatz. Aber die Ergebnisse? Sprechen fur sich. Hot take? Vielleicht. Aber die Zahlen lugen nicht.',
    },
    storytelling: {
      short: 'Vor 365 Tagen traf ich eine Entscheidung. Heute sehe ich das Ergebnis.',
      medium: 'Vor 365 Tagen traf ich eine Entscheidung, die alle fur veruckt hielten. Heute, ein Jahr spater, halte ich das Ergebnis in den Handen. Der Weg war alles andere als einfach.',
      long: 'Vor 365 Tagen traf ich eine Entscheidung, die alle fur veruckt hielten. Es gab Tage, an denen ich selbst gezweifelt habe. Nachte, in denen ich fast aufgegeben hatte. Aber heute, ein Jahr spater, halte ich das Ergebnis in den Handen. Der Weg war alles andere als einfach, aber er war es wert. Ein Thread.',
    },
  },
  linkedin: {
    professional: {
      short: 'Stolz, unser neuestes Projekt vorzustellen. Innovation trifft auf Exzellenz.',
      medium: 'Stolz, unser neuestes Projekt vorzustellen. Monatelange Arbeit, ein engagiertes Team und eine klare Vision haben zu diesem Ergebnis gefuhrt. Innovation trifft auf Exzellenz. Details im Kommentar.',
      long: 'Stolz, unser neuestes Projekt vorzustellen. Monatelange Arbeit, ein engagiertes Team und eine klare Vision haben zu diesem Ergebnis gefuhrt. Der Schlussel zum Erfolg war die enge Zusammenarbeit und der unbedingte Fokus auf Qualitat. Besonderer Dank gilt dem gesamten Team, das uber sich hinausgewachsen ist. Innovation trifft auf Exzellenz. Ich freue mich auf euer Feedback.',
    },
    casual: {
      short: 'Manchmal muss man einfach machen. Hier ist das Ergebnis.',
      medium: 'Manchmal muss man einfach machen, statt nur zu planen. Genau das haben wir getan, und das Ergebnis hat unsere eigenen Erwartungen ubertroffen. Was sind eure Erfahrungen damit?',
      long: 'Manchmal muss man einfach machen, statt nur zu planen. Genau das haben wir getan. Der Weg war nicht immer geradlinig, aber genau das macht den Unterschied zwischen Theorie und Praxis. Das Ergebnis hat unsere eigenen Erwartungen ubertroffen. Was sind eure Erfahrungen damit? Ich freue mich uber den Austausch in den Kommentaren.',
    },
    funny: {
      short: 'Laut meinem Lebenslauf bin ich Experte. Laut diesem Projekt stimmt das sogar.',
      medium: 'Laut meinem Lebenslauf bin ich Experte. Laut diesem Projekt stimmt das ausnahmsweise sogar. Wer hatte gedacht, dass zwischen Zoom-Calls und Kaffeepausen auch noch Zeit fur echte Arbeit bleibt?',
      long: 'Laut meinem Lebenslauf bin ich Experte. Laut diesem Projekt stimmt das ausnahmsweise sogar. Wer hatte gedacht, dass zwischen Zoom-Calls, Kaffeepausen und dem taglichen LinkedIn-Scrollen auch noch Zeit fur echte Arbeit bleibt? Spass beiseite, dieses Projekt hat richtig Spass gemacht. Danke an alle Beteiligten, besonders an den Kaffeeautomaten.',
    },
    provocative: {
      short: '95% der Unternehmen machen diesen Fehler. Wir nicht. Hier ist der Beweis.',
      medium: '95% der Unternehmen machen diesen einen Fehler. Wir haben uns bewusst dagegen entschieden und einen anderen Weg gewahlt. Das Ergebnis? Spricht fur sich. Hier ist der Beweis.',
      long: '95% der Unternehmen machen diesen einen Fehler: Sie optimieren fur kurzfristige Ergebnisse. Wir haben uns bewusst dagegen entschieden und in langfristigen Wert investiert. Das Ergebnis nach 12 Monaten? Spricht fur sich. Manchmal ist der unbequeme Weg der richtige. Stimmt ihr zu oder seht ihr das anders? Die Diskussion ist eroffnet.',
    },
    storytelling: {
      short: 'Vor einem Jahr stand ich vor einer Entscheidung. Heute teile ich das Ergebnis.',
      medium: 'Vor einem Jahr stand ich vor einer wegweisenden Entscheidung. Das Team war skeptisch, die Risiken hoch. Heute, 12 Monate spater, kann ich sagen: Es hat sich gelohnt. Hier ist unsere Geschichte.',
      long: 'Vor einem Jahr stand ich vor einer wegweisenden Entscheidung. Das Team war skeptisch, die Risiken hoch, und die Stimmen der Zweifler laut. Aber etwas in mir wusste, dass es der richtige Weg ist. 12 Monate spater stehe ich hier mit einem Ergebnis, das alle Erwartungen ubertroffen hat. Diese Reise hat uns als Team starker gemacht. Hier ist unsere Geschichte, mit allen Hohen und Tiefen.',
    },
  },
}

const DEMO_HASHTAGS = {
  instagram: ['#contentcreator', '#instadaily', '#reels', '#influencer', '#communitybuilding', '#growthmindset'],
  tiktok: ['#fyp', '#foryou', '#viral', '#trending', '#tiktokcreator', '#contentcreation'],
  youtube: ['#youtube', '#youtuber', '#subscribe', '#newvideo', '#contentcreator', '#behindthescenes'],
  twitter: ['#creator', '#digitalcontent', '#growthhacking', '#community', '#trending', '#thread'],
  linkedin: ['#leadership', '#innovation', '#business', '#growth', '#entrepreneurship', '#teamwork'],
}

const CaptionWriterPage = () => {
  const navigate = useNavigate()
  const [briefing, setBriefing] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [style, setStyle] = useState('casual')
  const [length, setLength] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [variantCount, setVariantCount] = useState(0)

  const handleGenerate = () => {
    if (!briefing.trim()) return
    setGenerating(true)
    setResult(null)
    setCopied(false)

    setTimeout(() => {
      const caption = DEMO_CAPTIONS[platform]?.[style]?.[length] || DEMO_CAPTIONS.instagram.casual.medium
      const hashtags = DEMO_HASHTAGS[platform] || DEMO_HASHTAGS.instagram
      const selectedHashtags = hashtags.sort(() => 0.5 - Math.random()).slice(0, 3)

      setResult({ caption, hashtags: selectedHashtags })
      setGenerating(false)
      setVariantCount(0)
    }, 1500)
  }

  const handleVariant = () => {
    setGenerating(true)
    setCopied(false)
    setTimeout(() => {
      const styles = Object.keys(DEMO_CAPTIONS[platform] || {})
      const otherStyles = styles.filter(s => s !== style)
      const randomStyle = otherStyles[Math.floor(Math.random() * otherStyles.length)] || style
      const caption = DEMO_CAPTIONS[platform]?.[randomStyle]?.[length] || DEMO_CAPTIONS.instagram.casual.medium
      const hashtags = (DEMO_HASHTAGS[platform] || DEMO_HASHTAGS.instagram).sort(() => 0.5 - Math.random()).slice(0, 3)

      setResult({ caption, hashtags })
      setGenerating(false)
      setVariantCount(prev => prev + 1)
    }, 1500)
  }

  const handleCopy = () => {
    if (!result) return
    const text = result.caption + '\n\n' + result.hashtags.join(' ')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const selectorButtonStyle = (isActive, accentColor) => ({
    padding: '10px 16px',
    borderRadius: '12px',
    border: isActive ? `2px solid ${accentColor || '#FF6B9D'}` : '1.5px solid #E8DFD3',
    background: isActive ? `${accentColor || '#FF6B9D'}10` : 'rgba(42,36,32,0.02)',
    color: isActive ? (accentColor || '#FF6B9D') : '#7A6F62',
    fontWeight: isActive ? '700' : '500',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/premium')} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>KI Caption Generator</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Perfekte Captions auf Knopfdruck</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #9B8FE6, #7B6FD6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(155,143,230,0.3)',
        }}>
          <Wand2 size={20} color="white" />
        </div>
      </div>

      {/* Demo Banner */}
      <Card style={{
        marginBottom: '20px', padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(155,143,230,0.08), rgba(155,143,230,0.04))',
        border: '1px solid rgba(155,143,230,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="#9B8FE6" />
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px' }}>Demo-Modus aktiv</p>
            <p style={{ fontSize: '12px', color: '#7A6F62' }}>KI-generierte Captions werden mit dem Pro-Plan freigeschaltet</p>
          </div>
        </div>
      </Card>

      {/* Briefing Input */}
      <Card style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '10px' }}>
          Briefing / Beschreibung
        </label>
        <p style={{ fontSize: '12px', color: '#A89B8C', marginBottom: '10px' }}>
          Beschreibe, worum es in deinem Content geht
        </p>
        <textarea
          value={briefing}
          onChange={e => setBriefing(e.target.value)}
          placeholder="z.B. 'Neues Outfit-Video fur Instagram, Herbst-Kollektion mit oversized Blazer und Vintage-Jeans, entspannte Vibes'"
          rows={4}
          style={{
            width: '100%', padding: '14px', background: 'rgba(42,36,32,0.03)',
            border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
            fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
            outline: 'none', boxSizing: 'border-box', lineHeight: '1.5',
          }}
        />
      </Card>

      {/* Platform Selector */}
      <Card style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '12px' }}>
          Plattform
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PLATFORMS.map(p => {
            const Icon = p.icon
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                style={selectorButtonStyle(platform === p.id, p.color)}
              >
                <Icon size={15} />
                {p.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Style Selector */}
      <Card style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '12px' }}>
          Stil
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              style={selectorButtonStyle(style === s.id, '#F5C563')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Length Selector */}
      <Card style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '12px' }}>
          Lange
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {LENGTHS.map(l => (
            <button
              key={l.id}
              onClick={() => setLength(l.id)}
              style={{
                ...selectorButtonStyle(length === l.id, '#6BC9A0'),
                flex: 1,
                flexDirection: 'column',
                padding: '12px 10px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: length === l.id ? '700' : '600' }}>{l.label}</span>
              <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: '400' }}>{l.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={generating || !briefing.trim()}
        style={{ width: '100%', padding: '16px', marginBottom: '20px', fontSize: '16px' }}
      >
        {generating ? (
          <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>&#9203;</span> Wird generiert...</>
        ) : (
          <><Wand2 size={18} /> Caption generieren</>
        )}
      </Button>

      {/* Result Section */}
      {result && (
        <div>
          {/* Generated Caption */}
          <Card style={{
            marginBottom: '16px', padding: '20px',
            background: 'linear-gradient(135deg, rgba(255,249,235,0.8), rgba(255,232,184,0.3))',
            border: '1.5px solid rgba(245,197,99,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={16} color="#9B8FE6" />
                <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Generierte Caption</span>
              </div>
              <button onClick={handleCopy} style={{
                padding: '8px 14px', borderRadius: '10px',
                border: copied ? '1.5px solid rgba(107,201,160,0.3)' : '1.5px solid #E8DFD3',
                background: copied ? 'rgba(107,201,160,0.08)' : 'rgba(42,36,32,0.02)',
                color: copied ? '#6BC9A0' : '#7A6F62',
                fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'inherit', transition: 'all 0.2s ease',
              }}>
                {copied ? <><Check size={14} /> Kopiert!</> : <><Copy size={14} /> Kopieren</>}
              </button>
            </div>
            <p style={{
              fontSize: '15px', color: '#2A2420', lineHeight: '1.7',
              whiteSpace: 'pre-wrap', fontFamily: 'inherit',
            }}>
              {result.caption}
            </p>
            {variantCount > 0 && (
              <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '10px' }}>
                Variante {variantCount + 1}
              </p>
            )}
          </Card>

          {/* Hashtag Suggestions */}
          <Card style={{ marginBottom: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Hash size={16} color="#F5C563" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Hashtag-Vorschlage</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.hashtags.map((tag, i) => (
                <span key={i} style={{
                  padding: '8px 14px', borderRadius: '10px',
                  background: 'rgba(245,197,99,0.08)', border: '1px solid rgba(245,197,99,0.15)',
                  color: '#E8A940', fontSize: '13px', fontWeight: '600',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          {/* Variant Button */}
          <Button
            variant="secondary"
            onClick={handleVariant}
            disabled={generating}
            style={{ width: '100%', padding: '14px' }}
          >
            {generating ? (
              <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>&#9203;</span> Wird generiert...</>
            ) : (
              <><RefreshCw size={16} /> Variante generieren</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CaptionWriterPage

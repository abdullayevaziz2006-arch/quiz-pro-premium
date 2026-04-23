export const parseWordQuiz = (html) => {
  // HTML formatida o'qish orqali qalin (bold) va tagiga chizilgan (underline) matnlarni aniqlay olamiz
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = doc.body.innerText || doc.body.textContent;
  
  // Savollarni ajratib olish (savollar odatda yangi qatordan boshlanadi)
  const segments = html.split(/<p[^>]*>\s*\?\s*/i).filter(s => s.trim().length > 0);
  const questions = [];

  segments.forEach(segment => {
    // Segment ichidan savol matni va variantlarni ajratamiz
    // Variantlar odatda yangi <p> yoki <li> ichida bo'ladi
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = segment;
    
    const pTags = tempDiv.querySelectorAll('p');
    if (pTags.length < 2) return;

    let questionText = pTags[0].innerText.trim();
    const options = [];
    let correctIdx = -1;

    for (let i = 1; i < pTags.length; i++) {
      const p = pTags[i];
      const optText = p.innerText.trim();
      
      if (optText) {
        // TO'G'RI JAVOBNI ANIQLASH:
        // 1. Matn boshida + yoki * bo'lsa
        // 2. Matn qalin (strong/b) bo'lsa
        // 3. Matn tagiga chizilgan (u) bo'lsa
        const isBold = p.querySelector('strong, b') !== null;
        const isUnderlined = p.querySelector('u') !== null;
        const hasMarker = optText.startsWith('+') || optText.startsWith('*');

        let cleanOpt = optText;
        if (hasMarker) cleanOpt = optText.substring(1).trim();

        if (hasMarker || isBold || isUnderlined) {
          correctIdx = options.length;
        }
        
        options.push(cleanOpt);
      }
    }

    if (questionText && options.length >= 2) {
      questions.push({
        text: questionText,
        options: options,
        correct: correctIdx !== -1 ? correctIdx : 0 // Agar topilmasa, birinchisini belgilab qo'yamiz (o'qituvchi o'zgartirishi uchun)
      });
    }
  });

  return questions;
};

// Eskisini ham qo'llab-quvvatlash uchun (agar faqat matn kelsa)
export const parseTextQuiz = (text) => {
  const segments = text.split(/\n\?|\r\n\?|^\?/).filter(s => s.trim().length > 0);
  const questions = [];

  segments.forEach(segment => {
    const lines = segment.split(/\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;

    let questionText = lines[0];
    const options = [];
    let correctIdx = -1;

    for(let i=1; i<lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('+') || line.startsWith('*')) {
        correctIdx = options.length;
        options.push(line.substring(1).trim());
      } else {
        options.push(line.replace(/^[=-]/, '').trim());
      }
    }

    if (questionText && options.length >= 2) {
      questions.push({
        text: questionText,
        options: options,
        correct: correctIdx !== -1 ? correctIdx : 0
      });
    }
  });

  return questions;
};

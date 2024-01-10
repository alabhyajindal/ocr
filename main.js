const tesseract = require('node-tesseract-ocr')
const sharp = require('sharp')

const IMAGE_PATH = process.argv[2] || './image1.jpg'

const config = {
  lang: 'eng',
  oem: 1,
  psm: 3,
}

async function cropAnswers() {
  const metadata = await sharp(IMAGE_PATH).metadata()
  sharp(IMAGE_PATH)
    .extract({
      left: metadata.width * 0.7,
      top: 0,
      width: Math.round(metadata.width * 0.3),
      height: metadata.height,
    })
    .toFile('./answers.jpg', (err, info) => {
      if (err) console.error(err)
    })
}

// cropAnswers()

async function cropQuestions() {
  const metadata = await sharp(IMAGE_PATH).metadata()
  sharp(IMAGE_PATH)
    .extract({
      left: 0,
      top: 0,
      width: Math.round(metadata.width * 0.2),
      height: metadata.height,
    })
    .toFile('./questions.jpg', (err, info) => {
      if (err) console.error(err)
    })
}

function getQuestionNumbers(text) {
  const regex = /\d+\.\s/g
  const matches = text.matchAll(regex)
  let questionNumbers = []
  for (const match of matches) {
    questionNumbers.push(match[0])
  }

  return questionNumbers
    .map((qn) => {
      const number = qn.split('.')[0]
      return Number(number)
    })
    .sort((a, b) => a - b)
}

cropQuestions().then(() => {
  tesseract
    .recognize('./questions.jpg', config)
    .then((text) => {
      const questionNumbers = getQuestionNumbers(text)
      console.log(questionNumbers)
    })
    .catch((error) => {
      console.log(error.message)
    })
})

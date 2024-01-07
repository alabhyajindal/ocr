const tesseract = require('node-tesseract-ocr')
const Jimp = require('jimp')

const IMAGE_PATH = process.argv[2] || './image1.jpg'

const config = {
  lang: 'eng',
  oem: 1,
  psm: 3,
}

function cropAnswers() {
  return Jimp.read(IMAGE_PATH)
    .then((image) => {
      const croppedWidth = image.getWidth() * 0.6 // Keep the first 60% width
      const croppedImage = image.crop(0, 0, croppedWidth, image.getHeight())
      return croppedImage.writeAsync('./answers.jpg')
    })
    .then(() => console.log('Image cropped successfully!'))
    .catch((err) => console.error('Error:', err))
}

async function cropQuestions() {
  try {
    const image = await Jimp.read(IMAGE_PATH)

    const { width, height } = image.bitmap

    const newWidth = Math.floor(width * 0.2)
    const newHeight = height

    const croppedImage = image.crop(0, 0, newWidth, newHeight)
    await croppedImage.writeAsync('./questions.jpg')
  } catch (error) {
    console.error('Error:', error.message)
  }
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

const questions = cropQuestions().then(() => {
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

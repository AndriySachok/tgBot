curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header 'Authorization: Bearer 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' \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/Users/andrij/Documents/angular/tg-test/voices/AwACAgIAAxkBAAODZbJosn2uv7awlhdPHkaYqdTuKiYAAkdAAAJpcJhJRg8IHdlhvBY0BA.mp3 \
  --form model=whisper-1
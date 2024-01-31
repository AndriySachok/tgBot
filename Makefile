build: 
	sudo docker build -t tgbot .
run:
	sudo docker run -d -p 443:443 --name tgBot --rm tgbot
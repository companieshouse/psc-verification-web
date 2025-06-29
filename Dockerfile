FROM node:22

ARG SSH_KEY
ENV SSH_KEY=$SSH_KEY
# Make ssh dir
RUN mkdir /root/.ssh/
# Create id_rsa from string arg, and set permissions
RUN echo "$SSH_KEY" >/root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
# Create known_hosts
RUN touch /root/.ssh/known_hosts
# Add git providers to known_hosts
RUN ssh-keyscan bitbucket.org >>/root/.ssh/known_hosts
RUN ssh-keyscan github.com >>/root/.ssh/known_hosts
RUN ssh-keyscan gitlab.com >>/root/.ssh/known_hosts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start:watch" ]
# ENTRYPOINT [ "bash" ]

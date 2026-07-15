FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    apache2 \
    libapache2-mod-auth-openidc \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod auth_openidc headers rewrite

COPY oidc.conf /etc/apache2/sites-available/oidc.conf
RUN a2dissite 000-default && a2ensite oidc

COPY public/ /var/www/html/public/
COPY secure/ /var/www/html/secure/

EXPOSE 8083

CMD ["apachectl", "-D", "FOREGROUND"]

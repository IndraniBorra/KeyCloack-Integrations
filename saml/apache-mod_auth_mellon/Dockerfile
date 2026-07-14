FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    apache2 \
    libapache2-mod-auth-mellon \
    openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod auth_mellon headers

# Generate SP metadata + keypair at build time
RUN mkdir -p /etc/apache2/mellon && \
    cd /etc/apache2/mellon && \
    openssl req -new -x509 -days 3650 -nodes \
        -newkey rsa:2048 \
        -keyout sp.key \
        -out sp.crt \
        -subj "/CN=localhost/OU=Demo/O=Example/L=City/ST=State/C=US"

COPY mellon.conf /etc/apache2/sites-available/mellon.conf
RUN a2dissite 000-default && a2ensite mellon

COPY public/ /var/www/html/public/
COPY secure/ /var/www/html/secure/
COPY idp-metadata.xml /etc/apache2/mellon/idp-metadata.xml

EXPOSE 8085

CMD ["apachectl", "-D", "FOREGROUND"]

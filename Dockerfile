FROM php:8.3-fpm

LABEL Maintainer="Vitalii Lyskov <vet1kk@gmail.com>"

RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libmcrypt-dev \
    libpng-dev \
    libicu-dev \
    libpq-dev \
    libxpm-dev \
    libvpx-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libgmp-dev \
    git \
    curl \
    wget \
    zip \
    unzip \
    gnupg2 \
    postgresql-client-common \
    postgresql-client \
    procps

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pecl install xdebug
RUN docker-php-ext-enable xdebug
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd
RUN docker-php-ext-install -j$(nproc) bcmath
RUN docker-php-ext-install -j$(nproc) mbstring
RUN docker-php-ext-install -j$(nproc) pdo_pgsql
RUN docker-php-ext-install -j$(nproc) pgsql

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
COPY .docker/conf/php/.pgpass /root/.pgpass
RUN chmod 600 /root/.pgpass
COPY .docker/conf/php/php.ini /usr/local/etc/php/conf.d/php-app.ini
COPY .docker/conf/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

FROM arm64v8/ubuntu:18.04 as base

ARG APP_USER_ID=999

# Dependencies + NodeJS
RUN apt-get -qq update && \
  echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
  apt-get -y -qq install software-properties-common &&\
  apt-add-repository "deb http://archive.canonical.com/ubuntu $(lsb_release -sc) partner" && \
  apt-get -qq update && apt-get -y -qq --no-install-recommends install \
  dumb-init \
  # adobe-flashplugin \
  # git \
  ffmpeg \
  fonts-liberation \
  msttcorefonts \
  fonts-roboto \
  fonts-ubuntu \
  fonts-noto-color-emoji \
  fonts-noto-cjk \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-kacst \
  fonts-freefont-ttf \
  fonts-thai-tlwg \
  fonts-indic \
  fontconfig \
  libappindicator3-1 \
  # pdftk \
  unzip \
  locales \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  libllvm8 \
  libgbm-dev \
  ca-certificates \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget \
  xvfb \
  curl &&\
  curl --silent --location https://deb.nodesource.com/setup_16.x | bash - &&\
  apt-get -y -qq install nodejs &&\
  apt-get -y -qq install build-essential

# Add the browserless user (appuser)
RUN groupadd -r appuser && useradd --uid ${APP_USER_ID} -r -g appuser -G audio,video appuser \
  && mkdir -p /home/appuser/Downloads \
  && chown -R appuser:appuser /home/appuser

# Install Chrome Stable
ENV CHROME_BINARY_LOCATION /usr/bin/google-chrome
RUN apt-get -y install chromium-browser && \
  ln -s /usr/bin/chromium-browser ${CHROME_BINARY_LOCATION}

# Install Chrome driver
ENV CHROMEDRIVERVERSION=14.0.1
ENV ARCH=arm64
RUN wget -q https://github.com/electron/electron/releases/download/v$CHROMEDRIVERVERSION/chromedriver-v$CHROMEDRIVERVERSION-linux-$ARCH.zip -O /tmp/driver.zip && \
  unzip /tmp/driver.zip -d /tmp/ && \
  mv -f /tmp/chromedriver /usr/bin/ && \
  chmod +x /usr/bin/chromedriver

# Install libvips
ENV LIBVIPSVERSION=8.11.3
RUN apt-get install -y -qq --no-install-recommends glib2.0-dev libexpat1-dev && \
  wget -q https://github.com/libvips/libvips/releases/download/v${LIBVIPSVERSION}/vips-${LIBVIPSVERSION}.tar.gz -O /tmp/vips-${LIBVIPSVERSION}.tar.gz && \
  cd /tmp && tar xf vips-${LIBVIPSVERSION}.tar.gz && cd vips-${LIBVIPSVERSION} && \
  ./configure && \
  make && make install && ldconfig

RUN fc-cache -f -v &&\
  apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

FROM base

ENV APP_DIR=/src
ENV USE_CHROME_STABLE=true
ENV CHROMEDRIVER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR $APP_DIR

RUN chown -R appuser:appuser $APP_DIR

USER appuser

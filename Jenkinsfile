pipeline {
  agent { label 'barcode-server' }

  environment {
    ENV_SOURCE   = "${WORKSPACE}/../.env-backend"
    COMPOSE_FILE = 'docker-compose.yml'

    // Telegram credentials (from Jenkins Credentials)
    TELEGRAM_TOKEN   = credentials('telegram-bot-token')
    TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
  }

  stages {

    stage('Notify: Build Started') {
      steps {
        script {
          def branch = sh(script: "git rev-parse --abbrev-ref HEAD || echo unknown", returnStdout: true).trim()
          def message = sh(script: "git log -1 --pretty=%s || echo N/A", returnStdout: true).trim()
          def author  = sh(script: "git log -1 --pretty=%ae || echo N/A", returnStdout: true).trim()
          def sha     = sh(script: "git rev-parse --short HEAD || echo N/A", returnStdout: true).trim()
          def time    = sh(script: "TZ='Asia/Kolkata' date '+%Y-%m-%d %H:%M:%S %Z'", returnStdout: true).trim()

          def text = """🚀 *Build Started!*
Project: ${env.JOB_NAME}
Branch : ${branch}
Commit : ${sha}
Author : ${author}
Message: ${message}
Build #: ${env.BUILD_NUMBER}
Started: ${time}

🔗 [Open Console Log](${env.BUILD_URL}console)
"""

          writeFile file: 'tg_start.txt', text: text

          sh '''
            curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
              -d "chat_id=${TELEGRAM_CHAT_ID}" \
              -d "parse_mode=Markdown" \
              --data-urlencode "text@tg_start.txt" >/dev/null
          '''
        }
      }
    }

    stage('Sanity') {
      steps {
        sh '''
          set -e
          echo "whoami: $(whoami)"
          echo "pwd: $(pwd)"
          ls -lah ..
          command -v docker
          docker --version
          docker compose version || true
        '''
      }
    }

    stage('Provide .env (copy from server path)') {
      steps {
        sh '''
          set -e
          [ -r "${ENV_SOURCE}" ] || { echo "❌ Cannot read ${ENV_SOURCE}"; exit 2; }

          cp "${ENV_SOURCE}" .env
          tr -d '\\r' < .env > .env.tmp && mv .env.tmp .env
          chmod 600 .env

          test -s .env || { echo "❌ .env is empty"; exit 3; }
          echo "✅ .env copied"
          head -n 5 .env | sed 's/=.*/=***redacted***/'
        '''
      }
    }

    stage('Build & Deploy Backend') {
      steps {
        sh '''
          set -e
          test -f "${COMPOSE_FILE}" || { echo "❌ Missing ${COMPOSE_FILE}"; exit 4; }
          test -s .env || { echo "❌ Missing .env"; exit 5; }

          docker compose -f "${COMPOSE_FILE}" --env-file .env up --build -d
          docker compose -f "${COMPOSE_FILE}" ps
        '''
      }
    }
  }

  post {
    success {
      script {
        notifyTelegram("SUCCESS ✅")
      }
    }

    failure {
      script {
        notifyTelegram("FAILURE ❌")
      }
    }

    always {
      echo "ℹ️ Pipeline finished."
    }
  }
}

/* ---------- Helper Function ---------- */
def notifyTelegram(status) {
  def branch = sh(script: "git rev-parse --abbrev-ref HEAD || echo unknown", returnStdout: true).trim()
  def message = sh(script: "git log -1 --pretty=%s || echo N/A", returnStdout: true).trim()
  def author  = sh(script: "git log -1 --pretty=%ae || echo N/A", returnStdout: true).trim()
  def sha     = sh(script: "git rev-parse --short HEAD || echo N/A", returnStdout: true).trim()
  def time    = sh(script: "TZ='Asia/Kolkata' date '+%Y-%m-%d %H:%M:%S %Z'", returnStdout: true).trim()
  def duration = currentBuild.durationString ?: "N/A"

  def text = """👋 *Build Completed!*
━━━━━━━━━━━━━━━━━━━━━━
Project : ${env.JOB_NAME}
Branch  : ${branch}
Commit  : ${sha}
Author  : ${author}
Message : ${message}
Time    : ${time}
Duration: ${duration}
Build #${env.BUILD_NUMBER} → ${status}
━━━━━━━━━━━━━━━━━━━━━━
🔗 [View Console](${env.BUILD_URL}console)
"""

  writeFile file: 'tg_end.txt', text: text

  sh '''
    curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "parse_mode=Markdown" \
      --data-urlencode "text@tg_end.txt" >/dev/null
  '''
}

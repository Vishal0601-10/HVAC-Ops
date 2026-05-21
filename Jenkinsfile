pipeline {
    agent any

    stages {

        stage('Build Backend') {
            steps {
                bat 'docker build -t hvac-backend .'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'docker build -t hvac-frontend .'
                }
            }
        }

        stage('Start Containers') {
            steps {
                bat 'docker compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                bat 'docker ps'
            }
        }

    }
}
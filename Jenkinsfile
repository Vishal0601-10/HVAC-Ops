pipeline {
    agent any

    stages {

        stage('Build Application') {
            steps {
                dir('hvac-complete') {
                    bat 'docker compose build'
                }
            }
        }

        stage('Stop Existing Containers') {
            steps {
                dir('hvac-complete') {
                    bat 'docker compose down'
                }
            }
        }

        stage('Run Application') {
            steps {
                dir('hvac-complete') {
                    bat 'docker compose up -d'
                }
            }
        }

        stage('Verify Containers') {
            steps {
                bat 'docker ps'
            }
        }
    }
}
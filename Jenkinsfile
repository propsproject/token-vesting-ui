node {
  def bucket = "propsproject-main-vesting"

  def repository = "token-vesting-ui"

  def error = null
  def environment = "vesting"

  try {
      timeout(time:120, uint: 'MINUTES') {
      cloneRepository()

      withCredentials([string(credentialsId: 'jenkins-vesting-cloudfront-key', variable: 'KEY'),string(credentialsId: 'jenkins-vesting-cloudfront-secret', variable: 'SECRET')]) {
        setupEnvironment(repository, KEY, SECRET)
      }

      announceFlow("Full flow, targeting ${environment}")
      buildJS(environment)
      deployToS3(environment, bucket)
      withCredentials([string(credentialsId: 'jenkins-vesting-cloudfront-distribution-id', variable: 'D_ID')]) {
        createCloudFrontInvalidation(D_ID)
      }

      slackSend color: 'good', message: "@${env.AUTHOR} → *${env.SLACK_NAME}* was deployed to *${environment}*."

      currentBuild.result = "SUCCESS"
    }
  } catch (e) {
    error = e
    stage('Notifying failure') {
      currentBuild.result = "FAILURE"
      slackSend color: 'danger', message: "@${env.AUTHOR} → *${env.SLACK_NAME}* failed.\nDetails here: ${e}\n${env.BlUE_OCEAN_URL}."
    }
  } finally {
    cleanArtifacts()
    if (error) {
      throw error
    }
  }
}

def setupEnvironment(repository, key, secret) {
  def node = tool name: 'node-8', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
  env.PATH = "${node}/bin:${env.PATH}"
  env.SLACK_NAME = "${repository}:${env.BRANCH_NAME}"
  env.REPOSITORY = "${repository}"
  env.JOB_SHORT_NAME = env.JOB_NAME.replaceFirst(/YouNow\/${repository}\//, "")
  env.BlUE_OCEAN_URL = "${env.JENKINS_URL}blue/organizations/jenkins/YouNow%2F${repository}/detail/${env.JOB_SHORT_NAME}/${env.BUILD_NUMBER}/pipeline"
  env.AWS_ACCESS_KEY_ID = "${key}"
  env.AWS_SECRET_ACCESS_KEY = "${secret}"
  env.AUTHOR = sh(
    script: "git --no-pager show -s --format='%an' HEAD",
    returnStdout: true
  ).trim().split(' ')[0].toLowerCase()
}

def buildJS(environment) {
  return stage('Building Javascript') {
      sh "npm install"
      sh "npm run build"
  }
}

def deployToS3(environment, bucket) {
    return stage("Deploying to S3 ${bucket}") {
        sh "aws s3 sync build/. s3://${bucket} --acl private"
    }
}

def cloneRepository() {
  return stage('Cloning Repository') {
    checkout scm
  }
}

def announceFlow(flow) {
  return stage('Computing Flow') {
    echo "Selected Flow: ${flow}"
    slackSend color: 'good', message: "@${env.AUTHOR} → processing *${env.SLACK_NAME}*. ${flow}.\n${env.BlUE_OCEAN_URL}."
  }
}

def createCloudFrontInvalidation(distributionId) {
  return stage("Create CloudFront Invalidation ${distributionId}") {
    sh "aws cloudfront create-invalidation --distribution-id ${distributionId} --paths /"
  }
}

def cleanArtifacts() {
  return stage('Cleaning Artifacts') {
    sh('rm -rf *')
  }
}

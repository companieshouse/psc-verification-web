# Deployment

### Development

Developers can implement code via a local docker environment (docker-chs-development). To view code changes in the local docker environment, developers can reload the service (in development mode) or restart the required docker container.

When satisfied with the implemented code, developers can push forward their git branch and request a peer review. After the code is approved, it can be merged into the development environment (CI-Dev). This is an automated process that runs via a concourse pipeline, across several jobs: -
- docker-build-ecr
- cidev-plan
- cidev-apply

After the final job in the development process succeeds (cidev-apply), the code is now deployed to the CI-Dev environment and available for testing.
Deployment to the staging environment is generally held until several code changes (related to jira tasks) have passed testing in CI-Dev. At this point, confluence release notes are produced. The notes follow a strict template and outline all the information required by the release team for a successful release. These include: -
-	A description of the changes.
-	Type of deployment (Mesos, ECS etc).
-	Backout plan for unsuccessful releases.
-	The service version to release.

Config changes required (if applicable).
A service now ticket is created and linked to the above release notes, allowing the release team to track the process.
When all information is in place, a request can be made to the release team via a slack channel (release_chs), requesting the following code changes be applied to the staging environment.

### Staging

The team receive a slack notification from the release team that the changes have been applied and provide a service now test task number. At this point, the test team can begin working through associated jira tasks, ensuring the code matches the outlined test criteria. Any failed tests result in notifying the development team to review the issue.
After all the jira tasks associated to the test ticket have been tested successfully, a further request is made to the release team to deploy into the live environment.

### Live

Like staging, the team receive a slack notification from the release team that the changes have been applied. No further action is required from the team.

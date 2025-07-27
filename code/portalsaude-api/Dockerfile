FROM quay.io/wildfly/wildfly:30.0.1.Final-jdk17


# Copia o WAR para dentro do WildFly
USER jboss
COPY target/portalsaude-api-0.0.1-SNAPSHOT.war /opt/jboss/wildfly/standalone/deployments/ROOT.war



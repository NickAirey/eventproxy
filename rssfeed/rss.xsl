<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="xml"/>

  <xsl:template match="/">
    <rss version="2.0">
      <channel>
        <title>NBC Events</title>
        <description>Narwee Baptist Church Events</description>
        <link>http://narweebaptist.org.au</link>
        <pubDate/>
        <image>
          <title>NBC logo</title>
          <link>http://narweebaptist.org.au</link>
          <url>http://www.narweebaptist.org.au/wordpress/wp-content/themes/arthemia-premium/images/logo/logo.gif</url>
        </image>
        <xsl:for-each select="rsp/events/event">
          <xsl:sort select="start_date"/>
          <item>
            <title><xsl:value-of select="name"/></title>
            <description><xsl:value-of select="description"/></description>
            <pubDate><xsl:value-of select="start_date"/></pubDate>
          </item>
        </xsl:for-each>
      </channel>
    </rss>
  </xsl:template>
</xsl:stylesheet>
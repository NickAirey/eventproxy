<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:date="http://exslt.org/dates-and-times"
                extension-element-prefixes="date"
                version="1.0">
  <xsl:template match="/">
    <rss version="2.0">
      <channel>
        <title>NBC Events</title>
        <description>Narwee Baptist Church Events</description>
        <link>http://narweebaptist.org.au</link>
        <pubDate>
          <xsl:value-of select="concat(date:day-abbreviation(), ', ', 
            format-number(date:day-in-month(), '00'), ' ', 
            date:month-abbreviation(), ' ', date:year(), ' ', 
            format-number(date:hour-in-day(), '00'), ':', 
            format-number(date:minute-in-hour(), '00'), ':', 
            format-number(date:second-in-minute(), '00'), ' +0000')" />  
        </pubDate>
        <image>
          <title>NBC logo</title>
          <link>http://narweebaptist.org.au</link>
          <url>http://www.narweebaptist.org.au/wordpress/wp-content/themes/arthemia-premium/images/logo/logo.gif</url>
        </image>
        <xsl:for-each select="rsp/events/event">
          <xsl:sort select="start_date" />
          <xsl:if test="not(position() > 15)">
            <item>
              <title><xsl:value-of select="name" /></title>
              <description><xsl:value-of select="description"/></description>
              <pubDate>
                <xsl:value-of select="start_date"/>
              </pubDate>
            </item>
          </xsl:if>
        </xsl:for-each>
      </channel>
    </rss>
  </xsl:template>
</xsl:stylesheet>